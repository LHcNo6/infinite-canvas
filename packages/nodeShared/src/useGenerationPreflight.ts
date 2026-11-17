import { nodeTools, z } from "@toonflow/nodes-scaffold/nodeTools";
import type { WorkspaceFiles } from "@toonflow/nodes-scaffold/workspaceFiles";

export type GenerationIssue = { level: "error" | "waiting" | "warning" | "unknown"; message: string };
export type GenerationPreflight = { ready: boolean; checkedAt: string; issues: GenerationIssue[] };

export async function inspectReferenceFiles(files: WorkspaceFiles, paths: string[], signal?: AbortSignal): Promise<GenerationIssue[]> {
  const issues: GenerationIssue[] = [];
  const folders = new Map<string, Awaited<ReturnType<WorkspaceFiles["list"]>>>();
  for (const path of new Set(paths)) {
    signal?.throwIfAborted();
    if (/^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(path)) { issues.push({ level: "unknown", message: "外部网址引用尚未核对，请先导入工作区" }); continue; }
    const folder = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
    try {
      let listing = folders.get(folder);
      if (!listing) { listing = await files.list(folder); folders.set(folder, listing); }
      if (!listing.entries.some(entry => entry.path === path && entry.type === "file")) issues.push({ level: "error", message: `参考文件不存在：${path}` });
    } catch (error) { issues.push({ level: "unknown", message: `无法核对参考文件 ${path}：${error instanceof Error ? error.message : String(error)}` }); }
  }
  return issues;
}

export function useGenerationPreflight(inspect: (signal?: AbortSignal) => GenerationIssue[] | Promise<GenerationIssue[]>) {
  async function inspectGeneration(signal?: AbortSignal): Promise<GenerationPreflight> {
    signal?.throwIfAborted();
    const issues = await inspect(signal);
    signal?.throwIfAborted();
    return { ready: issues.every(issue => issue.level === "warning"), checkedAt: new Date().toISOString(), issues };
  }
  nodeTools.register({
    name: "preflightGeneration",
    description: "只读检查当前生成配置、引用和连续性，不提交生成、不报价。ready 仅表示本次检查未发现阻塞；实际提交仍重新检查。",
    parameters: z.strictObject({}),
    execute(_args, { signal }) { return inspectGeneration(signal); },
  });
  async function assertReady(signal?: AbortSignal) {
    const result = await inspectGeneration(signal);
    if (!result.ready) throw new Error(result.issues.filter(issue => issue.level !== "warning").map(issue => issue.message).join("；"));
  }
  return { inspectGeneration, assertReady };
}
