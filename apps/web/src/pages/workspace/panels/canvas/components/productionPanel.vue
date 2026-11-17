<template>
  <panel class="productionPanel" :class="{ belowBalances: hasBalances }" position="top-right">
    <el-button :icon="IconClipboardList" :disabled="!canvasId" aria-label="制作与版本" @click="open">制作与版本</el-button>
  </panel>
  <el-dialog v-model="visible" title="制作与版本" width="min(760px, 94vw)" appendToBody :closeOnClickModal="false" :beforeClose="close">
    <div class="productionContent" v-loading="busy">
      <p v-if="failure" class="failure" role="alert">{{ failure }}</p>
      <el-tabs v-model="tab">
        <el-tab-pane label="生成前检查" name="preflight">
          <div class="actions"><el-button type="primary" @click="inspect">检查选中节点 / 全部生成节点</el-button></div>
          <p class="hint">检查不提交生成。结果只对应检查时的配置，实际提交仍会重新检查。</p>
          <p v-if="report">{{ report.stale ? '检查期间画布已变化，请重新检查' : report.ready ? '未发现阻塞项' : '存在阻塞或未完成检查' }} · {{ report.checkedAt }}</p>
          <p v-if="report && !report.items.length" class="hint">当前范围没有可检查的生成节点。</p>
          <div v-for="item in report?.items" :key="item.nodeId" class="entry">
            <el-button text @click="focus(item.nodeId)">{{ item.label }}</el-button>
            <span v-if="item.ready" class="success">通过</span>
            <p v-for="(issue, index) in item.issues" :key="index" :class="issue.level">{{ levelLabels[issue.level] }}：{{ issue.message }}</p>
          </div>
        </el-tab-pane>
        <el-tab-pane label="制作清单" name="production">
          <div class="actions">
            <el-select v-model="selected" aria-label="选择制作清单" @change="selectProduction"><el-option v-for="item in productions" :key="item.id" :label="item.title" :value="item.id" /></el-select>
            <el-button @click="newProduction">新建清单</el-button>
            <el-button @click="reloadProductions">重新读取</el-button>
          </div>
          <template v-if="draft">
            <el-input v-model="draft.title" aria-label="制作目标" placeholder="制作目标" :maxlength="200" @input="dirty = true" />
            <p class="hint">计划状态、生成核验、用于下游和人工审阅分别记录。继续制作前先保存并核验；刷新后需重新核验。</p>
            <div v-for="(step, index) in draft.steps" :key="step.id" class="entry">
              <div class="stepHeader"><el-input v-model="step.title" :aria-label="'步骤 ' + (index + 1)" :maxlength="300" @input="dirty = true" /><el-button text type="danger" @click="draft.steps.splice(index, 1); dirty = true">移除</el-button></div>
              <div class="stepFields">
                <el-select v-model="step.status" aria-label="计划状态" @change="dirty = true"><el-option v-for="(label, value) in statusLabels" :key="value" :label="label" :value="value" /></el-select>
                <el-select v-model="step.nodeId" clearable filterable aria-label="关联节点" placeholder="关联节点" @change="dirty = true"><el-option v-for="node in nodes" :key="node.id" :value="node.id" :label="String(node.data.label || node.id)" /></el-select>
                <el-input v-model="step.attemptId" clearable aria-label="生成尝试编号" placeholder="生成尝试编号" @input="dirty = true" />
                <el-input v-model="step.resultPath" clearable aria-label="实际结果路径" placeholder="实际结果路径" @input="dirty = true" />
              </div>
              <el-input v-model="step.note" aria-label="阻碍与下一步" placeholder="阻碍与下一步" :maxlength="2000" @input="dirty = true" />
              <div class="reviewRow"><el-checkbox v-model="step.usedDownstream" @change="dirty = true">已用于下游</el-checkbox><span>人工审阅：{{ draft.reviews?.[step.id] === 'accepted' ? '已采用' : draft.reviews?.[step.id] === 'rejected' ? '未采用' : '未审阅' }}</span><el-button text :disabled="dirty || !draft.id || verified(step.id)?.status !== 'succeeded'" @click="review(step.id)">确认采用</el-button></div>
              <p class="hint">{{ verified(step.id)?.message || '待核验；计划完成不等于生成成功' }}</p>
            </div>
            <div class="actions"><el-button :disabled="draft.steps.length >= 100" @click="addStep">添加步骤</el-button><el-button type="primary" @click="save">保存清单</el-button><el-button :disabled="dirty || !draft.id" @click="verify">核验实际状态</el-button></div>
            <p v-if="verification" class="hint">本次核验：{{ verification.checkedAt }}。不会自动续跑或重发生成。</p>
          </template>
        </el-tab-pane>
        <el-tab-pane label="关键版本" name="versions">
          <div class="actions"><el-input v-model="versionName" aria-label="版本名称" placeholder="版本名称" :maxlength="120" /><el-button type="primary" :disabled="!versionName.trim()" @click="capture">保存当前版本</el-button><el-button @click="reloadVersions">刷新</el-button></div>
          <p class="hint">保存正文、配置和本地素材。恢复会创建新画布，不覆盖当前画布、不重新生成。外部网址和插件私有状态需自行核对。</p>
          <div v-for="version in versions" :key="version.id" class="entry">
            <div class="stepHeader"><strong>{{ version.name }}</strong><el-button @click="restore(version.id)">恢复为新画布</el-button></div>
            <p class="hint">{{ version.sourceCanvas }} · {{ version.createdAt }}</p>
            <p v-for="warning in version.warnings" :key="warning" class="warning">{{ warning }}</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Panel, useVueFlow } from "@vue-flow/core";
import { IconClipboardList } from "@tabler/icons-vue";
import { ElButton, ElCheckbox, ElDialog, ElInput, ElLoading, ElMessage, ElMessageBox, ElOption, ElSelect, ElTabs, ElTabPane } from "element-plus";
import type { ProductionStep } from "@toonflow/tool-canvas/runtime";
import useWorkspaceFiles from "@/lib/workspaceFiles";
import { providerBalances } from "@/lib/providerBilling";
import { saveProduction, type CanvasSnapshot, type Production, type StepVerification } from "../canvasProduction";

const props = defineProps<{ canvasId: string; directory?: string; changed: number; execute(name: string, args: Record<string, unknown>): Promise<unknown> }>();
const flow = useVueFlow();
const nodes = computed(() => flow.getNodes.value);
const hasBalances = computed(() => providerBalances.value.some(item => item.id !== "tfRouter" || (item.balance && !item.error)));
const vLoading = ElLoading.directive;
const visible = ref(false);
const busy = ref(false);
const failure = ref("");
const tab = ref("preflight");
const versionName = ref("");
const versions = ref<Omit<CanvasSnapshot, "canvas" | "files">[]>([]);
const productions = ref<Production[]>([]);
const selected = ref("");
const draft = ref<{ id?: string; revision?: string; title: string; steps: ProductionStep[]; reviews?: Production["reviews"] }>();
const dirty = ref(false);
const verification = ref<{ checkedAt: string; items: StepVerification[] }>();
const report = ref<{ ready: boolean; stale?: boolean; checkedAt: string; items: { nodeId: string; label: string; ready: boolean; issues: { level: "error" | "waiting" | "warning" | "unknown"; message: string }[] }[] }>();
const statusLabels = { pending: "计划待办", doing: "计划进行中", done: "计划完成", blocked: "计划阻塞" };
const levelLabels = { error: "阻塞", waiting: "等待依赖", warning: "提醒", unknown: "未完成检查" };
const verified = (id: string) => !dirty.value ? verification.value?.items.find(item => item.id === id) : undefined;

async function execute(name: string, args: Record<string, unknown>) {
  const canvasId = props.canvasId;
  const directory = props.directory;
  const result = await props.execute(name, args);
  if (canvasId !== props.canvasId || directory !== props.directory) throw new Error("画布或工作区已变化");
  return result;
}
async function action(work: () => Promise<void>) {
  if (busy.value) return;
  const canvasId = props.canvasId;
  busy.value = true; failure.value = "";
  try { await work(); }
  catch (error) { if (props.canvasId === canvasId) failure.value = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || (error instanceof Error ? error.message : String(error)); }
  finally { busy.value = false; }
}
async function mayDiscard() {
  if (!dirty.value) return true;
  return ElMessageBox.confirm("清单有未保存修改，是否放弃？", "保留修改", { confirmButtonText: "放弃修改", cancelButtonText: "继续编辑", type: "warning" }).then(() => true, () => false);
}
async function open() { visible.value = true; await action(async () => { await loadProductions(); await loadVersions(); }); }
async function close(done: () => void) { if (!busy.value && await mayDiscard()) done(); }
async function loadVersions() { versions.value = (await execute("listCanvasSnapshots", {}) as { snapshots: typeof versions.value }).snapshots; }
async function loadProductions() {
  productions.value = (await execute("getProduction", {}) as { productions: Production[] }).productions;
  if (!draft.value && productions.value[0]) { selected.value = productions.value[0].id; draft.value = JSON.parse(JSON.stringify(productions.value[0])); }
}
async function reloadVersions() { await action(loadVersions); }
async function reloadProductions() {
  if (!await mayDiscard()) return;
  await action(async () => { draft.value = undefined; dirty.value = false; verification.value = undefined; await loadProductions(); });
}
async function selectProduction() {
  if (!await mayDiscard()) { selected.value = draft.value?.id ?? ""; return; }
  draft.value = JSON.parse(JSON.stringify(productions.value.find(item => item.id === selected.value))); dirty.value = false; verification.value = undefined;
}
async function newProduction() {
  if (!await mayDiscard()) return;
  selected.value = ""; draft.value = { title: "", steps: [] }; dirty.value = true; verification.value = undefined;
}
function addStep() { draft.value?.steps.push({ id: crypto.randomUUID(), title: "", status: "pending" }); dirty.value = true; }
async function save() {
  await action(async () => {
    if (!draft.value) return;
    const value = JSON.parse(JSON.stringify(draft.value)) as NonNullable<typeof draft.value>;
    value.steps = value.steps.map(step => ({ ...step, nodeId: step.nodeId || undefined, attemptId: step.attemptId || undefined, resultPath: step.resultPath || undefined }));
    const result = await execute("updateProduction", { productionId: value.id, revision: value.revision, title: value.title, steps: value.steps }) as Production;
    draft.value = result; selected.value = result.id; dirty.value = false; verification.value = undefined; await loadProductions();
  });
}
async function verify() { await action(async () => { if (draft.value?.id) verification.value = await execute("verifyProduction", { productionId: draft.value.id }) as typeof verification.value; }); }
async function review(id: string) {
  if (!draft.value?.id || dirty.value || verified(id)?.status !== "succeeded" || !props.directory) return;
  const canvasId = props.canvasId;
  const directory = props.directory;
  const value = JSON.parse(JSON.stringify(draft.value)) as NonNullable<typeof draft.value>;
  const accepted = await ElMessageBox.confirm("确认你已预览此步骤的实际结果，并决定采用？", "人工审阅", { confirmButtonText: "确认采用", cancelButtonText: "取消" }).then(() => true, () => false);
  if (!accepted || canvasId !== props.canvasId || directory !== props.directory || dirty.value || draft.value?.revision !== value.revision) return;
  await action(async () => {
    const current = await execute("verifyProduction", { productionId: value.id }) as { revision: string; items: StepVerification[] };
    if (current.revision !== value.revision || current.items.find(item => item.id === id)?.status !== "succeeded") throw new Error("清单在核验期间发生变化，请重新读取并核验");
    const saved = await saveProduction(useWorkspaceFiles(directory), canvasId, { productionId: value.id, revision: value.revision, title: value.title, steps: value.steps }, { ...value.reviews, [id]: "accepted" });
    if (canvasId !== props.canvasId || directory !== props.directory) return;
    draft.value = saved;
    await loadProductions();
  });
}
async function inspect() { await action(async () => { report.value = await execute("preflightCanvas", {}) as typeof report.value; }); }
async function capture() { await action(async () => { await execute("createCanvasSnapshot", { name: versionName.value }); versionName.value = ""; await loadVersions(); ElMessage.success("关键版本已保存"); }); }
async function restore(snapshotId: string) {
  const result = await ElMessageBox.prompt("为恢复的新画布命名。当前画布保留。", "恢复关键版本", { inputPlaceholder: "新画布名称", confirmButtonText: "恢复为新画布", cancelButtonText: "取消", inputValidator: value => !!value?.trim() || "请输入名称" }).catch(() => undefined);
  if (!result) return;
  await action(async () => {
    const restored = await execute("restoreCanvasSnapshot", { snapshotId, name: result.value }) as { canvasId: string; requiresContinuityReview: boolean };
    ElMessage.success(`已创建 ${restored.canvasId}${restored.requiresContinuityReview ? "，衔接参考需重新绑定" : ""}`);
  });
}
async function focus(id: string) { flow.getNodes.value.forEach(node => node.selected = node.id === id); await flow.fitView({ nodes: [id], padding: 0.3 }); }
watch(() => props.canvasId, () => { visible.value = false; draft.value = undefined; dirty.value = false; productions.value = []; verification.value = undefined; report.value = undefined; });
watch(() => props.changed, () => { if (visible.value && !busy.value && !dirty.value) void action(async () => { draft.value = undefined; verification.value = undefined; await loadProductions(); await loadVersions(); }); });
</script>

<style scoped lang="scss">
.productionPanel { .el-button { border-radius: var(--ui-radius-large, 12px); } }
.productionPanel.belowBalances { top: 52px; }
@container canvasWorkspace (max-width: 1040px) { .productionPanel.belowBalances { top: 92px; } }
.productionContent {
  max-height: 70dvh;
  overflow: auto;
  .actions, .stepHeader, .reviewRow { display: flex; align-items: center; gap: 8px; margin: 12px 0; flex-wrap: wrap; }
  .actions > .el-input, .actions > .el-select { flex: 1; min-width: 180px; }
  .stepHeader > .el-input { flex: 1; }
  .entry { padding: 12px 0; border-bottom: 1px solid var(--el-border-color-light); p { margin: 6px 0; overflow-wrap: anywhere; } }
  .stepFields { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-bottom: 8px; }
  .hint { color: var(--el-text-color-secondary); font-size: 12px; line-height: 1.7; }
  .failure, .error { color: var(--el-color-danger); }
  .warning, .waiting, .unknown { color: var(--el-color-warning); }
  .success { color: var(--el-color-success); }
  @media (max-width: 540px) { .stepFields { grid-template-columns: 1fr; } }
}
</style>
