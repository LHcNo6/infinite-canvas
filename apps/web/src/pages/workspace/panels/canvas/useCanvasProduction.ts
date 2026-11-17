import { ref } from "vue";
import { useVueFlow } from "@vue-flow/core";
import { useNodeToolsContext } from "@toonflow/nodes-scaffold/nodeTools";
import { canvasSchemas } from "@toonflow/tool-canvas/runtime";
import useWorkspaceFiles from "@/lib/workspaceFiles";
import { createCanvasSnapshot, listCanvasSnapshots, restoreCanvasSnapshot, getProduction, listProductions, saveProduction, type StepVerification } from "./canvasProduction";

type PreflightItem = { nodeId: string; label: string; ready: boolean; issues: { level: "error" | "waiting" | "warning" | "unknown"; message: string }[] };
export function useCanvasProduction(options: {
  binding(): { directory: string; canvasId: string };
  flushSave(): Promise<void>;
  availableTypes(): string[];
  registerCanvas(canvas: { id: string; name: string }): void;
}) {
  const flow = useVueFlow();
  const nodeTools = useNodeToolsContext();
  const changed = ref(0);

  async function execute(name: string, raw: Record<string, unknown>, signal?: AbortSignal): Promise<unknown> {
    const binding = options.binding();
    if (!binding.directory || !binding.canvasId) throw new Error("请先选择画布");
    const files = useWorkspaceFiles(binding.directory);
    const ensureCurrent = () => {
      signal?.throwIfAborted();
      const current = options.binding();
      if (current.directory !== binding.directory || current.canvasId !== binding.canvasId) throw new Error("画布或工作区已变化，请重新操作");
    };
    ensureCurrent();
    if (name === "preflightCanvas") {
      const args = canvasSchemas.preflightCanvas.parse(raw);
      const selected = flow.getSelectedNodes.value;
      const candidates = args.nodeIds ? args.nodeIds.map(id => flow.findNode(id)) : selected.length ? selected : flow.getNodes.value.filter(node => ["imageGenerationNode", "videoGenerationNode"].includes((node.type ?? "").replace(/^remote-/, "")));
      const items: PreflightItem[] = [];
      const before = JSON.stringify(flow.toObject());
      for (const node of candidates) {
        ensureCurrent();
        if (!node) throw new Error("指定节点不存在，请重新选择");
        const item: PreflightItem = { nodeId: node.id, label: String(node.data.label ?? node.id), ready: false, issues: [] };
        if (![...nodeTools().list([node.id], ["node:preflightGeneration"])].length) item.issues.push({ level: "unknown", message: "此节点未提供生成前检查能力" });
        else {
          try {
            const result = await nodeTools().call({ nodeId: node.id, name: "node:preflightGeneration", args: {} }, signal) as { ready: boolean; issues: PreflightItem["issues"] };
            item.ready = result.ready;
            item.issues = result.issues;
          } catch (error) { item.issues.push({ level: "unknown", message: error instanceof Error ? error.message : String(error) }); }
        }
        items.push(item);
      }
      ensureCurrent();
      if (JSON.stringify(flow.toObject()) !== before) return { ready: false, checkedAt: new Date().toISOString(), items, stale: true, message: "检查期间画布发生变化，请重新检查" };
      return { ready: items.length > 0 && items.every(item => item.ready), checkedAt: new Date().toISOString(), items };
    }
    if (name === "createCanvasSnapshot") {
      const args = canvasSchemas.createCanvasSnapshot.parse(raw);
      await options.flushSave();
      ensureCurrent();
      const before = JSON.stringify(flow.toObject());
      const result = await createCanvasSnapshot(files, binding.canvasId, args.name, () => {
        ensureCurrent();
        return JSON.stringify(flow.toObject()) === before;
      }, signal);
      changed.value++;
      return result;
    }
    if (name === "listCanvasSnapshots") {
      canvasSchemas.listCanvasSnapshots.parse(raw);
      return { snapshots: await listCanvasSnapshots(files) };
    }
    if (name === "restoreCanvasSnapshot") {
      const args = canvasSchemas.restoreCanvasSnapshot.parse(raw);
      const result = await restoreCanvasSnapshot(files, args.snapshotId, args.name, options.availableTypes(), signal);
      ensureCurrent();
      options.registerCanvas({ id: result.canvasId, name: result.canvasId.slice(0, -5) });
      changed.value++;
      return result;
    }
    if (name === "getProduction") {
      const args = canvasSchemas.getProduction.parse(raw);
      if (!args.productionId) return { productions: await listProductions(files, binding.canvasId) };
      const production = await getProduction(files, args.productionId);
      if (production.canvasPath !== binding.canvasId) throw new Error("制作清单不属于当前画布");
      return production;
    }
    if (name === "updateProduction") {
      const args = canvasSchemas.updateProduction.parse(raw);
      const result = await saveProduction(files, binding.canvasId, args);
      ensureCurrent();
      changed.value++;
      return result;
    }
    if (name === "verifyProduction") {
      const args = canvasSchemas.verifyProduction.parse(raw);
      const production = await getProduction(files, args.productionId);
      if (production.canvasPath !== binding.canvasId) throw new Error("制作清单不属于当前画布");
      const checkedAt = new Date().toISOString();
      const items: StepVerification[] = [];
      for (const step of production.steps) {
        ensureCurrent();
        const item: StepVerification = { id: step.id, status: "unknown", checkedAt, message: "尚未核验" };
        const node = step.nodeId ? flow.findNode(step.nodeId) : undefined;
        if (!step.nodeId) Object.assign(item, { status: "unlinked", message: "未关联节点；计划状态不能作为生成证据" });
        else if (!node) Object.assign(item, { status: "missing", message: "关联节点已删除或不在当前画布" });
        else if (!step.attemptId) Object.assign(item, { status: "unlinked", message: "未关联生成尝试；旧输出不能证明本次成功" });
        else {
          try {
            const response = await fetch("/api/ai/media/calls/list", { method: "POST", headers: { "Content-Type": "application/json", "x-toonflow-workspace": "1" }, body: JSON.stringify({ directory: binding.directory, canvasId: node.data.modelCallCanvasId || binding.canvasId, nodeId: node.id }), signal });
            const body = await response.json();
            if (!response.ok || body.code !== 200) throw new Error(body.message || "调用记录不可读取");
            const call = (body.data as { id: string; status: string; results?: { path: string }[] }[]).find(call => call.id === step.attemptId);
            if (!call) item.message = "找不到此生成尝试的独立记录";
            else if (call.status === "succeeded") {
              if (!step.resultPath || !call.results?.some(result => result.path === step.resultPath)) item.message = "结果路径缺失或不属于此生成尝试";
              else { await files.read(step.resultPath); Object.assign(item, { status: "succeeded", message: "本次调用成功且结果文件可读取；尚不代表审阅采用" }); }
            } else if (["failed", "cancelled"].includes(call.status)) Object.assign(item, { status: "failed", message: call.status === "cancelled" ? "本地调用已取消，不证明远端任务或费用撤销" : "本次生成失败" });
            else {
              const current = await nodeTools().call({ nodeId: node.id, name: "node:getGenerationStatus", args: {} }, signal) as { attemptId?: string; status?: string };
              if (current.attemptId === step.attemptId && current.status === "running") Object.assign(item, { status: "running", message: "当前页面仍持有本次运行任务" });
              else item.message = "历史记录未结束，当前无法证明任务仍在运行；禁止自动重发";
            }
          } catch (error) { item.message = error instanceof Error ? error.message : String(error); }
        }
        items.push(item);
      }
      ensureCurrent();
      if ((await getProduction(files, production.id)).revision !== production.revision) throw new Error("清单在核验期间发生变化，请重新读取并核验");
      return { productionId: production.id, revision: production.revision, checkedAt, items };
    }
    throw new Error("不支持的制作操作");
  }
  return { execute, changed };
}
