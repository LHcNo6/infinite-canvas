import type { GeneratedMedia, MediaGenerationRequest } from "@toonflow/tools-scaffold/runtime";
import { error, errorFromCause, success, type ApiResponse } from "@/lib/responseFormat";
import { generateMedia, queryVideoTask, saveMediaAssets } from "@/utils/media/generation";
import * as calls from "@/utils/media/calls";

type MediaTask = {
  cwd: string;
  controller: AbortController;
  touchedAt: number;
  settledAt?: number;
  result?: ApiResponse<GeneratedMedia[]>;
  scope?: calls.CallScope;
  call?: calls.MediaCall;
  saveError?: string;
  saving?: boolean;
  submissionUnknown?: boolean;
};

// ACT: 运行任务只在单进程中保留，结束后缓存 5 分钟；成品地址另写调用记录以便重启后下载。
const tasks = new Map<string, MediaTask>();
const recovering = new Set<string>();

function stop(task: MediaTask, message: string) {
  if (task.result) return;
  task.result = error<GeneratedMedia[]>(message, null, 499);
  task.controller.abort(new Error(message));
}

function cleanup() {
  const now = Date.now();
  for (const [taskId, task] of tasks) {
    if (task.settledAt !== undefined) {
      if (!task.saveError && task.settledAt + 300000 <= now) tasks.delete(taskId);
    } else if (task.touchedAt + 120000 <= now) stop(task, "生成任务因页面长时间未连接而停止");
  }
}

const cleanupTimer = setInterval(cleanup, 30000);
cleanupTimer.unref();

export async function start(cwd: string, taskId: string, mediaType: "image" | "video" | "audio", request: MediaGenerationRequest, scope?: calls.CallScope) {
  cleanup();
  if (tasks.has(taskId)) throw Object.assign(new Error("生成任务已存在，请勿重复提交"), { status: 409 });
  // ACT: 最多 1000 个任务；取消后仍等待生成 Promise 收尾，避免忽略取消的供应商绕过上限。
  if (tasks.size >= 1000) throw Object.assign(new Error("生成任务过多，请稍后重试"), { status: 429 });
  const task: MediaTask = { cwd, controller: new AbortController(), touchedAt: Date.now(), scope };
  tasks.set(taskId, task);
  const startedAt = Date.now();
  if (scope && mediaType !== "audio") {
    task.call = { id: scope.callId, type: mediaType, providerId: request.providerId, modelId: request.modelId, startedAt: scope.startedAt, durationMs: 0, status: "preparing", detail: "正在准备提交", outputDirectory: request.outputDirectory ?? "assets/generated" };
    try {
      await calls.save(cwd, scope, task.call, true);
      task.call = { ...task.call, status: "running", detail: "模型调用进行中" };
      await calls.save(cwd, scope, task.call);
    } catch (error) {
      tasks.delete(taskId);
      throw new Error("模型调用记录保存失败，未提交生成请求", { cause: error });
    }
  }
  let stage = "prepare";
  let errorCode = "";
  console.info("[媒体任务] 开始", { taskId, mediaType, providerId: request.providerId, modelId: request.modelId });
  const checkpoint = task.scope && task.call ? {
    async task(id: string) {
      if (!id.trim() || id.length > 512) throw new Error("上游任务 ID 无效");
      task.call = { ...task.call!, upstreamTaskId: id };
      try { await calls.save(cwd, task.scope!, task.call); }
      catch (cause) { throw new Error(`上游任务已提交，但任务 ID 保存失败；任务 ID：${id}，请勿重新提交`, { cause }); }
    },
    async assets(assets: MediaAsset[], outputDirectory: string) {
      if (!assets.every((asset): asset is Extract<MediaAsset, { type: "url" }> => asset.type === "url")) return;
      task.call = { ...task.call!, recovery: { outputDirectory, assets }, detail: "上游已返回成品，正在下载保存" };
      await calls.save(cwd, task.scope!, task.call);
    },
  } : undefined;
  void generateMedia(cwd, mediaType, request, task.controller.signal, value => { stage = value; }, checkpoint).then(
    files => { task.result ??= success(files); },
    cause => {
      task.submissionUnknown = (cause as { name?: string })?.name === "SubmissionUnknownError";
      let current: unknown = cause;
      for (let depth = 0; depth < 5 && current && typeof current === "object"; depth++) {
        const detail = current as { code?: unknown; cause?: unknown };
        if (typeof detail.code === "string" && /^[A-Z][A-Z0-9_]{1,63}$/.test(detail.code)) errorCode = detail.code;
        current = detail.cause;
      }
      const failure = errorFromCause(cause);
      task.result ??= { ...failure, message: `${task.call?.recovery ? "上游已返回成品，本地下载或保存未完成；可在模型调用记录中重试下载，不会重新生成。\n" : ""}${failure.message}\n执行阶段：${stage}${errorCode ? `\n错误码：${errorCode}` : ""}`, data: null };
    },
  ).finally(async () => {
    task.saving = true;
    task.settledAt = Date.now();
    if (task.scope && task.call && task.result) {
      const result = task.result;
      task.call = { ...task.call, endedAt: new Date(task.settledAt).toISOString(), durationMs: Math.max(0, task.settledAt - Date.parse(task.call.startedAt)),
        status: result.code === 200 ? "succeeded" : result.code === 499 ? "cancelled" : task.submissionUnknown ? "unknown" : "failed",
        detail: result.code === 200 ? `生成完成，返回 ${result.data?.length ?? 0} 个结果。` : result.message.slice(0, 16000),
        ...(result.code === 200 && result.data ? { results: result.data.map(({ path, mimeType }) => ({ path, mimeType })) } : {}) };
      if (result.code === 200) delete task.call.recovery;
      await persist(task);
    }
    task.saving = false;
    console.info("[媒体任务] 结束", { taskId, mediaType, stage, code: task.result?.code, errorCode: errorCode || undefined, durationMs: task.settledAt - startedAt });
  });
}

async function persist(task: MediaTask) {
  if (!task.scope || !task.call) return;
  try {
    await calls.save(task.cwd, task.scope, task.call);
    task.saveError = undefined;
    await calls.prune(task.cwd, task.scope).catch(error => console.warn("清理模型调用记录失败", error));
  } catch (error) {
    task.saveError = "最终状态保存失败，请在模型调用记录中重试保存";
    console.error(task.saveError, error);
  }
}

export async function listCalls(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">) {
  const records = await calls.list(cwd, scope);
  return records.map(record => {
    let call = record;
    const task = tasks.get(call.id);
    if (task?.cwd === cwd && task.scope?.canvasId === scope.canvasId && task.scope.nodeId === scope.nodeId) {
      if (task.saveError && task.call) call = { ...task.call };
    } else if (call.status === "running" || call.status === "preparing") {
      call = { ...call, status: "unknown", detail: "本地任务已不可确认，远端状态未知；请查看供应商记录，勿直接重复提交。" };
    }
    // 签名下载地址只保存在工作区记录中，不发送到调用记录列表或画布。
    const { recovery, ...visible } = call;
    const idle = (!task || task.settledAt !== undefined) && !task?.saving;
    const upstreamTaskId = taskIdentity(call);
    return { ...visible, upstreamTaskId, canQuery: idle && canQuery(call) && !!upstreamTaskId,
      canDownload: !!recovery && call.status !== "succeeded" && idle,
      canSupplyResult: idle && !recovery && !call.results?.length && ["failed", "cancelled", "unknown"].includes(call.status),
      ...(task?.saveError ? { saveError: task.saveError } : {}) };
  });
}

function canQuery(call: calls.MediaCall) {
  return call.type === "video" && call.providerId === "antaixin" && ["seedance-2.5-video", "seedance-2.0-video-fast-enhance", "wan-3.0", "minimax-h3"].includes(call.modelId);
}

function taskIdentity(call: calls.MediaCall) {
  return call.upstreamTaskId || (canQuery(call) ? /任务 ID[：:]\s*(task_[a-zA-Z0-9_-]+)/.exec(call.detail)?.[1] : undefined);
}

export async function queryCall(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">, callId: string) {
  const key = JSON.stringify([cwd, scope.canvasId, scope.nodeId, callId]);
  const task = tasks.get(callId);
  if (recovering.has(key) || task && (task.settledAt === undefined || task.saving)) throw Object.assign(new Error("该调用仍在处理中，请等待完成"), { status: 409 });
  recovering.add(key);
  try {
    const call = await calls.load(cwd, scope, callId);
    const id = taskIdentity(call);
    if (!canQuery(call) || !id) throw Object.assign(new Error("没有可查询的上游任务 ID"), { status: 400 });
    const callScope = { ...scope, callId, startedAt: call.startedAt };
    call.upstreamTaskId = id;
    call.lastQueriedAt = new Date().toISOString();
    call.queryError = false;
    try {
      // 只调用供应商的原任务 GET 查询能力，不进入 generateMedia 或生成接口。
      const result = await queryVideoTask(cwd, call.providerId, call.modelId, id);
      call.upstreamStatus = result.status;
      call.queryDetail = result.detail || "";
      if (!call.results?.length) {
        if (result.status === "succeeded") {
          const assets = result.assets;
          if (!assets?.length || !assets.every((asset): asset is Extract<MediaAsset, { type: "url" }> => asset.type === "url" && asset.mediaType === "video")) throw new Error("原任务未返回可下载的成品地址");
          call.recovery = { assets, outputDirectory: call.outputDirectory ?? `assets/${scope.nodeId}` };
          call.status = "unknown";
          call.queryDetail = "上游已完成，点击重新下载保存成品；不会重新生成。";
        } else {
          call.status = ["failed", "expired"].includes(result.status) ? "failed" : result.status === "cancelled" ? "cancelled" : "unknown";
        }
      }
    } catch (cause) {
      call.queryError = true;
      call.queryDetail = cause instanceof Error ? cause.message : "查询原任务失败";
      await calls.save(cwd, callScope, call);
      if (task) task.call = call;
      throw cause;
    }
    await calls.save(cwd, callScope, call);
    if (task) task.call = call;
    return { status: call.upstreamStatus, detail: call.queryDetail };
  } finally { recovering.delete(key); }
}

export async function recoverCall(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">, callId: string, url?: string) {
  const key = JSON.stringify([cwd, scope.canvasId, scope.nodeId, callId]);
  const task = tasks.get(callId);
  if (recovering.has(key) || task && (task.settledAt === undefined || task.saving)) throw Object.assign(new Error("该调用仍在处理中，请等待完成"), { status: 409 });
  recovering.add(key);
  try {
    const call = await calls.load(cwd, scope, callId);
    const callScope = { ...scope, callId, startedAt: call.startedAt };
    if (!call.recovery && url && !call.results?.length) {
      call.recovery = { outputDirectory: call.outputDirectory ?? `assets/${scope.nodeId}`, assets: [{ mediaType: call.type, type: "url", url }] };
      await calls.save(cwd, callScope, call);
      if (task) task.call = call;
    }
    if (!call.recovery || call.status === "succeeded") throw Object.assign(new Error("没有可恢复的成品地址"), { status: 404 });
    // ACT: 恢复路径只接收已保存的成品，绝不加载供应商或调用生成接口。
    const files = await saveMediaAssets(cwd, call.type, call.recovery.assets, call.recovery.outputDirectory, AbortSignal.timeout(240000));
    const recovered: calls.MediaCall = { ...call, status: "succeeded", detail: `成品下载恢复完成，保存 ${files.length} 个结果；未重新提交生成。`, results: files.map(({ path, mimeType }) => ({ path, mimeType })) };
    delete recovered.recovery;
    await calls.save(cwd, callScope, recovered);
    if (task) { task.call = recovered; task.result = success(files); task.saveError = undefined; }
    return files;
  } finally { recovering.delete(key); }
}

export async function retryCall(cwd: string, scope: Pick<calls.CallScope, "canvasId" | "nodeId">, callId: string) {
  const task = tasks.get(callId);
  if (!task || task.cwd !== cwd || task.scope?.canvasId !== scope.canvasId || task.scope.nodeId !== scope.nodeId || !task.saveError) throw Object.assign(new Error("没有可重试保存的最终状态"), { status: 404 });
  await persist(task);
  if (task.saveError) throw new Error(task.saveError);
}

export function status(cwd: string, taskIds: string[]) {
  cleanup();
  return taskIds.map(taskId => {
    const task = tasks.get(taskId);
    if (!task || task.cwd !== cwd) return { taskId, result: error<GeneratedMedia[]>("生成任务不存在或已过期", null, 404) };
    task.touchedAt = Date.now();
    return { taskId, ...(task.result && task.settledAt !== undefined && !task.saving ? { result: task.saveError ? { ...task.result, message: `${task.result.message}\n${task.saveError}` } : task.result, saveError: task.saveError } : {}) };
  });
}

export function cancel(cwd: string, taskIds: string[]) {
  for (const taskId of taskIds) {
    const task = tasks.get(taskId);
    if (task?.cwd === cwd) stop(task, "生成已取消");
  }
}
