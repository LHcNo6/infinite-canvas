import { computed, onScopeDispose, ref, watch, type Ref } from "vue";
import { nodeTools, z } from "@toonflow/nodes-scaffold/nodeTools";
import type { NodeOutputs } from "@toonflow/nodes-scaffold/values";
import type { NodeGenerationCall, NodeModelCall, useNodeAi } from "@toonflow/nodes-scaffold/nodeAi";

export function useNodeGeneration(outputs: Readonly<Ref<NodeOutputs>>, cancel: () => void,
  options?: { mediaType: "image" | "video"; getModelCalls: () => NodeModelCall[] | undefined;
    ai: Pick<ReturnType<typeof useNodeAi>, "getModelCalls" | "retryDownload"> }) {
  const status = ref<"idle" | "running" | "succeeded" | "failed">("idle");
  const error = ref("");
  const generating = computed(() => status.value === "running");
  let attempt: NodeGenerationCall | undefined;
  const getStatus = () => ({
    status: status.value, outputs: outputs.value, ...attempt,
    ...(options ? { mediaType: options.mediaType, modelCallId: attempt?.attemptId,
      modelCall: options.getModelCalls()?.find(call => call.id === attempt?.attemptId) } : {}),
    ...(error.value ? { error: error.value } : {}),
  });
  const validateAttempt = (attemptId?: string) => {
    if (attemptId && attemptId !== attempt?.attemptId) throw new Error("生成编号不匹配，请重新查询当前任务，不能采用其他尝试的结果");
  };
  const pendingWaits = new Set<() => void>();
  onScopeDispose(() => { for (const cancelWait of pendingWaits) cancelWait(); });

  nodeTools.register({
    name: "getGenerationStatus",
    description: "查询本次打开节点后的生成状态、生成编号、启动时间、媒体类型及对应模型调用记录。当前输出可能来自之前的生成；idle 不证明本次成功。可提供 attemptId 核对本次尝试",
    parameters: z.strictObject({ attemptId: z.uuid().optional() }),
    execute({ attemptId }) { validateAttempt(attemptId); return getStatus(); },
  });
  nodeTools.register({
    name: "waitGeneration",
    description: "等待本次生成，可传 attemptId。底层每次最多30秒；画布 Agent 工具会合并图片/视频的连续等待，图片5分钟检查一次再等2.5分钟，视频10分钟检查一次再等5分钟。waitBudgetExceeded 只表示停止等待，不取消任务、不自动重试。节点卸载或取消调用时停止等待",
    parameters: z.strictObject({ attemptId: z.uuid().optional(), timeoutMs: z.number().int().min(1).max(30000).optional() }),
    async execute({ attemptId, timeoutMs = 30000 }, { signal }) {
      signal?.throwIfAborted();
      validateAttempt(attemptId);
      const expectedAttemptId = attempt?.attemptId;
      if (!generating.value) return getStatus();
      return await new Promise<ReturnType<typeof getStatus>>((resolve, reject) => {
        const finish = (failure?: unknown) => {
          clearTimeout(timer);
          stop();
          signal?.removeEventListener("abort", onAbort);
          pendingWaits.delete(onDispose);
          if (failure) reject(failure);
          else if (attempt?.attemptId !== expectedAttemptId) reject(new Error("等待期间生成任务已变化，请重新核对生成编号"));
          else resolve(getStatus());
        };
        const onAbort = () => finish(signal?.reason ?? new Error("等待已取消"));
        const onDispose = () => finish(new Error("节点已卸载，无法继续等待生成"));
        const stop = watch(status, (value) => { if (value !== "running") finish(); });
        const timer = setTimeout(() => finish(), timeoutMs);
        pendingWaits.add(onDispose);
        signal?.addEventListener("abort", onAbort, { once: true });
        if (signal?.aborted) onAbort();
      });
    },
  });
  nodeTools.register({
    name: "cancelGeneration",
    description: "请求停止当前后台生成；cancellationRequested 表示已发出停止请求，随后用 getGenerationStatus 查询终止状态。不会删除已有输出，不能保证供应商撤销任务或费用",
    parameters: z.strictObject({}),
    execute() {
      const cancellationRequested = generating.value;
      if (cancellationRequested) cancel();
      return { ...getStatus(), cancellationRequested };
    },
  });

  if (options) {
    const describeCall = (call: NodeModelCall, fullDetail = false) => {
      const text = (value?: string) => value?.replace(/https?:\/\/[^\s<>"']+/gi, "[链接已隐藏]").slice(0, fullDetail ? 16000 : 4000);
      // 只返回公开字段；旧画布记录也不透传恢复地址或其他内部字段。
      return {
        id: call.id, type: call.type, providerId: call.providerId, modelId: call.modelId,
        startedAt: call.startedAt, durationMs: call.durationMs, status: call.status, detail: text(call.detail),
        results: call.results, saveError: text(call.saveError), canDownload: !!call.canDownload,
        canQuery: !!call.canQuery, canSupplyResult: !!call.canSupplyResult,
        upstreamTaskId: call.upstreamTaskId, upstreamStatus: call.upstreamStatus,
        lastQueriedAt: call.lastQueriedAt, queryDetail: text(call.queryDetail), queryError: call.queryError,
      };
    };
    nodeTools.register({
      name: "getModelCalls",
      description: "读取此节点的持久模型调用记录，合并旧画布记录，同编号优先服务端记录。可按 callId 查看详情，或用 offset/limit 分页（默认10条，最多50条）。返回状态、错误、结果路径和 canDownload/canQuery/canSupplyResult；不查询供应商、不生成媒体。canQuery 表示可在调用记录窗口查询原任务，未知状态不能视为失败后重新生成",
      parameters: z.strictObject({ callId: z.uuid().optional(), offset: z.number().int().min(0).optional(), limit: z.number().int().min(1).max(50).optional() }),
      async execute({ callId, offset = 0, limit = 10 }, { signal }) {
        const calls = await options.ai.getModelCalls(signal);
        signal?.throwIfAborted();
        if (callId) {
          const call = calls.find(item => item.id === callId);
          if (!call) throw new Error("此节点没有该模型调用记录，请先查询记录列表");
          return { call: describeCall(call, true) };
        }
        const page = calls.slice(offset, offset + limit);
        const hasMore = offset + page.length < calls.length;
        return { calls: page.map(call => describeCall(call)), total: calls.length, offset, limit, hasMore,
          ...(hasMore ? { nextOffset: offset + page.length } : {}) };
      },
    });
    nodeTools.register({
      name: "retryDownload",
      description: "仅重新下载指定 callId 的原成品，不重新生成、不覆盖节点输出。先用 getModelCalls 核对记录；canDownload 为 true 可直接下载，canSupplyResult 为 true 时可提供用户给出的 HTTP(S) 成品直链 url，禁止猜测链接。成功返回 files 和更新后的 call，使用结果仍由用户在记录窗口选择。工具最多等待120秒，取消或超时不代表后端下载已停止，必须先重读记录，禁止自动重复下载或生成",
      parameters: z.strictObject({ callId: z.uuid(), url: z.string().trim().max(16384).url().refine(value => {
        const url = new URL(value);
        return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password;
      }, "请提供不含账号密码的 HTTP(S) 成品直链").optional() }),
      async execute({ callId, url }, { signal }) {
        const calls = await options.ai.getModelCalls(signal);
        signal?.throwIfAborted();
        const call = calls.find(item => item.id === callId);
        if (!call || call.type !== options.mediaType) throw new Error("此节点没有该媒体调用记录，请先查询记录列表");
        if (call.status === "succeeded" && call.results?.length) {
          return { callId, files: call.results, call: describeCall(call, true), outputChanged: false, alreadySaved: true,
            message: "该调用已有保存结果，未重复下载；可在调用记录窗口使用结果。" };
        }
        if (url ? !call.canSupplyResult : !call.canDownload) {
          throw new Error(call.canQuery ? "此调用暂无可直接下载的成品，请在调用记录窗口重新查询原任务；未重新生成。"
            : call.canSupplyResult ? "此调用缺少成品地址，请提供用户从供应商后台取得的成品直链；未重新生成。"
            : "此调用正在处理或没有可恢复的独立记录，请稍后重读调用记录；未重新生成。");
        }
        const files = await options.ai.retryDownload(callId, url, signal);
        signal?.throwIfAborted();
        const updated = (await options.ai.getModelCalls(signal)).find(item => item.id === callId);
        signal?.throwIfAborted();
        if (!updated) throw new Error("成品已下载，但未读到更新后的记录，请重读调用记录，勿直接重复下载。");
        return { callId, files, call: describeCall(updated, true), outputChanged: false, alreadySaved: false,
          message: "成品已保存，未重新生成、未替换节点输出；可在调用记录窗口使用结果。" };
      },
    });
  }

  async function run<T>(task: (call: NodeGenerationCall) => Promise<T>, attemptId = crypto.randomUUID()): Promise<T> {
    if (generating.value) throw new Error("节点正在生成，请等待完成");
    attempt = { attemptId, startedAt: new Date().toISOString() };
    status.value = "running";
    error.value = "";
    try {
      const result = await task(attempt);
      status.value = "succeeded";
      return result;
    } catch (failure) {
      status.value = "failed";
      const message = (failure as { response?: { data?: { message?: string } } })?.response?.data?.message;
      error.value = failure instanceof Error && failure.name === "AbortError" ? "生成已取消"
        : message || (failure instanceof Error ? failure.message : "生成失败");
      throw failure;
    }
  }

  return { generating, run, getAttempt: () => attempt };
}
