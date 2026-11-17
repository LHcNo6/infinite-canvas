import axios from "axios";
import { z, productionStepSchema, type ProductionStep } from "@toonflow/tool-canvas/runtime";
import type { Node, Edge, ViewportTransform } from "@vue-flow/core";
import type useWorkspaceFiles from "@/lib/workspaceFiles";
import { remapNodeReferences } from "./canvasFiles";

type Files = ReturnType<typeof useWorkspaceFiles>;
type SavedCanvas = { toonflowCanvas: true; nodes: Node[]; edges: Edge[]; viewport: ViewportTransform };
function validCanvas(value: unknown): value is SavedCanvas {
  if (!value || typeof value !== "object") return false;
  const canvas = value as SavedCanvas;
  if (canvas.toonflowCanvas !== true || !Array.isArray(canvas.nodes) || !Array.isArray(canvas.edges)) return false;
  if (!canvas.viewport || ![canvas.viewport.x, canvas.viewport.y, canvas.viewport.zoom].every(Number.isFinite) || canvas.viewport.zoom <= 0) return false;
  const ids = new Map<string, Node>();
  for (const node of canvas.nodes) {
    if (!node || typeof node.id !== "string" || !/^[^/\\\0]+$/.test(node.id) || [".", ".."].includes(node.id) || ids.has(node.id)) return false;
    if (typeof node.type !== "string" || !node.data || typeof node.data !== "object" || Array.isArray(node.data) || !node.position || ![node.position.x, node.position.y].every(Number.isFinite)) return false;
    ids.set(node.id, node);
  }
  for (const node of canvas.nodes) {
    const ancestors = new Set([node.id]);
    let parent = node.parentNode;
    while (parent) {
      if (ancestors.has(parent) || !ids.has(parent)) return false;
      ancestors.add(parent);
      parent = ids.get(parent)!.parentNode;
    }
  }
  const edges = new Set<string>();
  return canvas.edges.every(edge => {
    if (!edge || typeof edge.id !== "string" || !edge.id || edges.has(edge.id) || !ids.has(edge.source) || !ids.has(edge.target)) return false;
    if ([edge.sourceHandle, edge.targetHandle].some(handle => handle != null && typeof handle !== "string")) return false;
    edges.add(edge.id);
    return true;
  });
}
const relativePath = z.string().min(1).max(4096).refine(value => !/^(?:[a-z][a-z\d+.-]*:|[\\/])/i.test(value) && !value.split(/[\\/]/).some(part => !part || part === ".." || part === "."), "仅支持工作区相对路径");
const snapshotSchema = z.object({
  format: z.literal(1), id: z.uuid(), name: z.string(), createdAt: z.string(), sourceCanvas: relativePath,
  files: z.array(z.object({ path: relativePath, stored: relativePath, sha256: z.string().regex(/^[a-f0-9]{64}$/) })),
  warnings: z.array(z.string()), canvas: z.custom<SavedCanvas>(validCanvas),
});
export type CanvasSnapshot = z.output<typeof snapshotSchema>;
const productionSchema = z.object({
  format: z.literal(1), id: z.uuid(), title: z.string().min(1).max(200), canvasPath: relativePath,
  updatedAt: z.string(), steps: z.array(productionStepSchema).max(100).refine(items => new Set(items.map(item => item.id)).size === items.length),
  reviews: z.record(z.string(), z.enum(["accepted", "rejected"])).default({}),
});
export type Production = z.output<typeof productionSchema> & { revision: string };
export type StepVerification = { id: string; status: "succeeded" | "running" | "failed" | "unknown" | "missing" | "unlinked"; message: string; checkedAt: string };

export function missingFile(error: unknown) {
  return axios.isAxiosError(error) && (error.response?.status === 404 || error.response?.data?.data?.code === "ENOENT");
}

export async function ensureFolders(files: Files, path: string) {
  const parts = path.split("/");
  for (let index = 1; index <= parts.length; index++) {
    await files.mkdir(parts.slice(0, index).join("/")).catch(error => {
      if (!axios.isAxiosError(error) || error.response?.data?.data?.code !== "EEXIST") throw error;
    });
  }
}

async function digest(bytes: ArrayBuffer) {
  if (!globalThis.crypto?.subtle) throw new Error("当前环境无法核对版本文件完整性");
  return Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), byte => byte.toString(16).padStart(2, "0")).join("");
}

function referencedFiles(value: unknown, paths: Set<string>, warnings: Set<string>, key = "") {
  if (typeof value === "string") {
    if (value.startsWith("assets/") || ["url", "path", "textPath", "videoUrl", "imageUrl", "source", "guide"].includes(key) && value.includes("/")) {
      if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) warnings.add("外部网址素材不包含在本地版本中，恢复时需自行核对可用性");
      else if (relativePath.safeParse(value).success) paths.add(value);
    }
  } else if (Array.isArray(value)) value.forEach(item => referencedFiles(item, paths, warnings, key));
  else if (value && typeof value === "object") Object.entries(value).forEach(([field, item]) => referencedFiles(item, paths, warnings, field));
}

export async function createCanvasSnapshot(files: Files, sourceCanvas: string, name: string, unchanged: () => boolean, signal?: AbortSignal) {
  const before = await files.readTextSnapshot(sourceCanvas);
  const canvas = JSON.parse(before.text) as SavedCanvas;
  if (!validCanvas(canvas)) throw new Error("画布格式无效");
  const paths = new Set<string>();
  const warnings = new Set<string>();
  for (const node of canvas.nodes) {
    if (!/^[^/\\\0]+$/.test(node.id) || [".", ".."].includes(node.id)) throw new Error("节点标识无效");
    referencedFiles(node.data, paths, warnings);
    if (!new Set(["textNode", "imageNode", "imageGenerationNode", "videoNode", "videoGenerationNode", "videoComposeNode", "canvasGroup"]).has((node.type ?? "").replace(/^remote-/, ""))) warnings.add("包含其他节点插件；仅保存画布数据、节点素材目录及公开文件引用，不保证插件私有状态可恢复");
    const folders = [`assets/${node.id}`];
    for (const folder of folders) {
      const entries = await files.list(folder).catch(error => { if (missingFile(error)) return { entries: [] }; throw error; });
      for (const entry of entries.entries) {
        if (entry.type === "directory") folders.push(entry.path);
        else paths.add(entry.path);
      }
    }
  }
  const id = crypto.randomUUID();
  const root = `.toonflow/canvasSnapshots/${id}`;
  const saved: CanvasSnapshot = { format: 1, id, name, sourceCanvas, createdAt: new Date().toISOString(), canvas, files: [], warnings: [...warnings] };
  await ensureFolders(files, `${root}/files`);
  try {
    // ACT: 顺序复制并逐文件核对，内存最多持有一个素材；不建立自动快照或后台复制服务。
    for (const path of paths) {
      signal?.throwIfAborted();
      const sha256 = await digest(await files.read(path));
      const stored = `files/${saved.files.length}${path.match(/\.[a-z\d]{1,10}$/i)?.[0] ?? ""}`;
      await files.copy(path, `${root}/${stored}`);
      if (await digest(await files.read(`${root}/${stored}`)) !== sha256) throw new Error(`素材在复制期间发生变化：${path}`);
      saved.files.push({ path, stored, sha256 });
    }
    for (const file of saved.files) {
      signal?.throwIfAborted();
      if (await digest(await files.read(file.path)) !== file.sha256) throw new Error(`素材在保存期间发生变化：${file.path}`);
    }
    if (!unchanged() || (await files.readTextSnapshot(sourceCanvas)).revision !== before.revision) throw new Error("画布在保存版本期间发生变化，请重新保存版本");
    signal?.throwIfAborted();
    // 清单最后独占写入；未完成的目录不会进入版本列表。
    await files.writeJson(`${root}/snapshot.json`, saved, true);
    return { id, name, createdAt: saved.createdAt, sourceCanvas, fileCount: saved.files.length, warnings: saved.warnings };
  } catch (error) {
    await files.remove(root, true).catch(() => { /* 不发布的版本目录保留供人工清理。 */ });
    throw error;
  }
}

export async function listCanvasSnapshots(files: Files) {
  const root = ".toonflow/canvasSnapshots";
  const listing = await files.list(root).catch(error => { if (missingFile(error)) return { entries: [] }; throw error; });
  const items: Omit<CanvasSnapshot, "canvas" | "files">[] = [];
  for (const entry of listing.entries) {
    if (entry.type !== "directory" || !z.uuid().safeParse(entry.name).success) continue;
    const value = await files.readJson(`${entry.path}/snapshot.json`).catch(error => { if (missingFile(error)) return; throw error; });
    if (!value) continue;
    const { canvas: _canvas, files: _files, ...metadata } = snapshotSchema.parse(value);
    items.push(metadata);
  }
  return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function restoreCanvasSnapshot(files: Files, snapshotId: string, name: string, availableTypes: string[], signal?: AbortSignal) {
  z.uuid().parse(snapshotId);
  name = name.trim().replace(/\.json$/i, "");
  if (!name.trim() || /[\\/<>:"|?*\x00-\x1f]/.test(name) || [".", ".."].includes(name)) throw new Error("画布名称无效");
  const root = `.toonflow/canvasSnapshots/${snapshotId}`;
  const snapshot = snapshotSchema.parse(await files.readJson(`${root}/snapshot.json`));
  if (snapshot.id !== snapshotId || new Set(snapshot.files.map(file => file.path)).size !== snapshot.files.length || new Set(snapshot.files.map(file => file.stored)).size !== snapshot.files.length) throw new Error("版本素材索引无效");
  const missing = snapshot.canvas.nodes.filter(node => node.type !== "canvasGroup" && !availableTypes.includes(node.type ?? ""));
  if (missing.length) throw new Error(`缺少节点插件，未恢复：${[...new Set(missing.map(node => node.type))].join("、")}`);
  const canvas = structuredClone(snapshot.canvas);
  const ids = new Map(canvas.nodes.map(node => [node.id, crypto.randomUUID()]));
  if (ids.size !== canvas.nodes.length || canvas.edges.some(edge => !ids.has(edge.source) || !ids.has(edge.target))) throw new Error("版本节点或连线无效");
  const assetId = crypto.randomUUID();
  const created: string[] = [];
  const paths = new Map<string, string>();
  try {
    await ensureFolders(files, "assets");
    for (const [index, file] of snapshot.files.entries()) {
      signal?.throwIfAborted();
      if (!/^files\/[0-9]+(?:\.[a-z\d]{1,10})?$/i.test(file.stored)) throw new Error("版本素材索引无效");
      if (await digest(await files.read(`${root}/${file.stored}`)) !== file.sha256) throw new Error(`版本素材已损坏：${file.path}`);
      const own = file.path.match(/^assets\/([^/]+)\/(.+)$/);
      const directory = `assets/${own && ids.has(own[1]!) ? ids.get(own[1]!) : assetId}`;
      const target = own && ids.has(own[1]!) ? `${directory}/${own[2]}` : `${directory}/${index}${file.path.match(/\.[a-z\d]{1,10}$/i)?.[0] ?? ""}`;
      if (!created.includes(directory)) { await files.mkdir(directory); created.push(directory); }
      await ensureFolders(files, target.slice(0, target.lastIndexOf("/")));
      await files.copy(`${root}/${file.stored}`, target);
      paths.set(file.path, target);
    }
    const remap = (value: unknown): unknown => {
      if (typeof value === "string") return paths.get(value) ?? value;
      if (Array.isArray(value)) return value.map(remap);
      if (value && typeof value === "object") return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, remap(item)]));
      return value;
    };
    for (const node of canvas.nodes) {
      node.id = ids.get(node.id)!;
      if (node.parentNode) node.parentNode = ids.get(node.parentNode);
      node.data = remap(node.data) as Node["data"];
      delete node.data.modelCallCanvasId;
      node.data.modelCalls = [];
      if (node.data.firstFrameBinding || node.data.continuityReferenceBinding) {
        node.data.continuityNeedsReview = true;
        delete node.data.firstFrameBinding;
        delete node.data.continuityReferenceBinding;
      }
      delete node.data.lastFrameNodeId;
      delete node.data.lastFrameOwnerId;
      delete node.data.lastFrameRecord;
      delete node.data.lastGenerationRecord;
      Reflect.deleteProperty(node, "initialized");
      Reflect.set(node, "selected", false);
      remapNodeReferences(node, ids);
      if (node.type?.replace(/^remote-/, "") === "videoComposeNode" && Array.isArray(node.data.videoCompose?.clips)) {
        for (const clip of node.data.videoCompose.clips) {
          if (clip.source && ids.has(clip.source)) {
            clip.source = ids.get(clip.source)!;
            clip.key = JSON.stringify([clip.source, clip.sourceHandle]);
          }
        }
      }
    }
    canvas.edges = canvas.edges.map(edge => ({ ...edge, id: crypto.randomUUID(), source: ids.get(edge.source)!, target: ids.get(edge.target)!, selected: false }));
    signal?.throwIfAborted();
    const canvasId = `${name}.json`;
    await files.writeJson(canvasId, canvas, true);
    return { canvasId, warnings: snapshot.warnings, requiresContinuityReview: canvas.nodes.some(node => node.data.continuityNeedsReview) };
  } catch (error) {
    const cleanup = await Promise.allSettled(created.map(path => files.remove(path, true)));
    if (cleanup.some(result => result.status === "rejected")) throw new Error(`恢复失败，部分新素材未能清理：${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }
}

export async function getProduction(files: Files, productionId: string): Promise<Production> {
  const snapshot = await files.readTextSnapshot(`.toonflow/productions/${z.uuid().parse(productionId)}.json`);
  const production = productionSchema.parse(JSON.parse(snapshot.text));
  if (production.id !== productionId) throw new Error("制作清单已变化或不属于当前画布，请重新读取；当前修改未写入");
  return { ...production, revision: snapshot.revision };
}

export async function listProductions(files: Files, canvasPath: string) {
  const listing = await files.list(".toonflow/productions").catch(error => { if (missingFile(error)) return { entries: [] }; throw error; });
  const records: Production[] = [];
  for (const entry of listing.entries) {
    if (!/^[0-9a-f-]{36}\.json$/i.test(entry.name)) continue;
    const record = await getProduction(files, entry.name.slice(0, -5));
    if (record.canvasPath === canvasPath) records.push(record);
  }
  return records.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export async function saveProduction(files: Files, canvasPath: string, input: { productionId?: string; revision?: string; title: string; steps: ProductionStep[] }, reviews?: Production["reviews"]) {
  const previous = input.productionId ? await getProduction(files, input.productionId) : undefined;
  if (previous && (previous.canvasPath !== canvasPath || previous.revision !== input.revision)) throw new Error("制作清单已变化或不属于当前画布，请重新读取；当前修改未写入");
  if (input.steps.some(step => step.resultPath && !relativePath.safeParse(step.resultPath).success)) throw new Error("成果路径必须位于工作区内");
  const id = previous?.id ?? crypto.randomUUID();
  const value = productionSchema.parse({ format: 1, id, canvasPath, title: input.title, steps: input.steps, reviews: reviews ?? previous?.reviews ?? {}, updatedAt: new Date().toISOString() });
  // 已审阅决定只属于同一个步骤的同一份结果。
  for (const key of Object.keys(value.reviews)) {
    const before = previous?.steps.find(step => step.id === key);
    const after = value.steps.find(step => step.id === key);
    if (!after || before?.attemptId !== after.attemptId || before?.resultPath !== after.resultPath || before?.nodeId !== after.nodeId) delete value.reviews[key];
  }
  const path = `.toonflow/productions/${id}.json`;
  if (previous) await files.writeTextSnapshot(path, JSON.stringify(value, null, 2), { revision: input.revision!, encoding: "utf-8" });
  else { await ensureFolders(files, ".toonflow/productions"); await files.writeJson(path, value, true); }
  return getProduction(files, id);
}

export async function moveProductionLinks(files: Files, previous: string, target: string) {
  const listing = await files.list(".toonflow/productions").catch(error => { if (missingFile(error)) return { entries: [] }; throw error; });
  const changed: { path: string; before: string; revision: string }[] = [];
  try {
    for (const entry of listing.entries) {
      if (!/^[0-9a-f-]{36}\.json$/i.test(entry.name)) continue;
      const record = await getProduction(files, entry.name.slice(0, -5));
      if (record.canvasPath !== previous && !record.canvasPath.startsWith(`${previous}/`)) continue;
      const { revision, ...data } = record;
      const before = JSON.stringify(data, null, 2);
      data.canvasPath = target + record.canvasPath.slice(previous.length);
      const next = await files.writeTextSnapshot(entry.path, JSON.stringify(data, null, 2), { revision, encoding: "utf-8" });
      changed.push({ path: entry.path, before, revision: next });
    }
  } catch (error) {
    const rollback = await Promise.allSettled(changed.map(item => files.writeTextSnapshot(item.path, item.before, { revision: item.revision, encoding: "utf-8" })));
    if (rollback.some(item => item.status === "rejected")) throw new Error("制作清单关联更新失败且部分回退冲突，请检查清单中的画布路径；未覆盖冲突内容");
    throw error;
  }
}
