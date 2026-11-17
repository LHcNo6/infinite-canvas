import { createToolConfig } from "@toonflow/tools-scaffold";

await createToolConfig({
  name: "canvas",
  displayName: "画布操作",
  description: "新增、切换、重命名和自动整理画布，操作节点、连线和视口，并调用节点注册的函数。",
  author: "Toonflow",
  github: "https://github.com/HBAI-Ltd/Toonflow-app",
  prompt: `getCanvas 默认只读画布概览，按需用 include 查询画布列表或可用节点类型。findCanvasNodes 按名称、ID、类型或选择状态定位节点；已知 ID 时直接用 getCanvasNodes 读取必要字段，用 getCanvasEdges 查询局部连线，用 getNodeTools 查询目标节点函数。用户可能同时编辑画布，状态变化后重新查询，不把旧快照当作当前状态。
所有读取都有条数和体积上限，检查 hasMore/nextCursor 与截断信息；空列表但 hasMore 为 true 仍需继续扫描。继续分页时保留原查询参数，只替换 cursor，游标失效时重新查询。全图任务逐批完成，只保留进度摘要和游标，不将全部节点详情累积到上下文。
批量改写已有内容前先 createCanvasSnapshot 保存关键版本；失败时停止覆盖。图片/视频提交前用 preflightCanvas 检查目标节点，检查不生成、不代替算力授权。多步骤制作使用 getProduction/updateProduction 保存稳定步骤、nodeId、attemptId 与实际结果路径，更新携带 revision；继续前 verifyProduction，状态未知不自动重发。计划完成、调用成功、用于下游和人工采用分别记录。恢复版本只创建新画布，不代表生成恢复。
使用实际提供的画布操作工具修改画布，不直接写入画布 JSON 代替界面操作。新建或切换画布后，后续操作针对返回的新画布。
节点业务参数和执行行为通过已注册的 nodeTools 操作；nodeId、node:functionName 和参数结构以 getNodeTools 返回值为准，args 根据用户任务填写，不能猜测未注册的函数或字段。
图片和视频的 node:waitGeneration 会在工具内部合并连续等待；记录启动回执并传 attemptId。图片5分钟、视频10分钟检查本次调用记录一次，再分别等2.5分钟、5分钟。返回 waitBudgetExceeded 时报告仍在运行、等待已达上限并保留任务，不自动重复等待或重新生成；稍后继续先读取原任务状态。
图片/视频生成明确失败后的恢复流程（交互、自动模式均适用）：
1. 只对本次调用的明确 failed 触发：说明失败节点、已知原因，暂停该节点及依赖链，保留已有成果。等待超时、waitBudgetExceeded、启动不确定、状态未知及用户主动取消分别报告真实状态，不当作明确生成失败。
2. 先用 askUser 合并本批失败，列出节点及本次尝试，提供单选“我手动处理”“允许 Agent 查看并尝试下载恢复”。说明手动入口是“节点 → 调用记录与恢复”；第二项仅授权查看列出的失败调用并对每条最多发起一次原成品下载恢复，不重新生成、不自动采用结果。记录卡片与 nodeId、modelCallId 的对应关系；无提问工具时直接询问并等待。跳过、取消、未回答或普通“继续”均不授权；已有自动模式预算或重试余量也不能跳过本选择。用户已明确授权同一批失败的查看与一次下载恢复时沿用该授权。
3. 获批后先 getNodeTools 发现实际函数及 schema，再按对应 callId 调用 node:getModelCalls 读取本次详情；缺少调用身份时先用真实生成状态核对，无法确定归属则请用户手动查看，不按最新一条或历史失败猜测。授权不覆盖其他节点、其他调用或后续失败。只有明确失败才进入下载恢复；若记录已成功且有结果，交付已有结果，不重复下载；运行中、取消或未知时报告并停止。
4. canDownload=true 时，对该 callId 调用一次 node:retryDownload；仅 canSupplyResult=true 且用户提供了该调用的 HTTP(S) 成品直链时才传 url，不猜链接。没有地址或需查询原视频任务时，引导用户在窗口“重新查询原任务（不重新生成）”或“补充成品链接并下载”；canQuery 不是 Agent 查询工具，不调用隐藏接口。缺工具、记录读取失败或不可恢复时，说明原因并保留手动入口。
5. 下载失败、超时、取消或结果不明确时，停止恢复并先按该 callId 重读记录一次后报告；前端最多等120秒、后端可能仍在下载，禁止自动重复下载或重新生成。恢复返回 files 只表示文件保存，outputChanged=false，提示用户在“调用记录与恢复”中点击“使用结果”；在用户采用并核对实际输出前保持依赖链暂停。恢复授权不包含重新生成；后续新生成须明确取得针对失败对象的生成授权，并同时满足原模式范围、总次数、每对象重试余量及为其余初次调用保留的预算。
连线前核对输出端口、输入端口及类型兼容性；节点位置使用画布坐标，合理留出内容和连线空间。已有节点能够复用时不要重复创建。
deleteNodes、moveNodes、renameNodes、connectNodes、deleteEdges 均一次接受多个目标，涉及多个节点或连线时合并为一次调用，不要逐个单独调用；任一目标校验失败则整体不生效，需按返回的错误修正后重新提交整批。
每次操作等待返回结果，用 getCanvasNodes/getCanvasEdges 只核对受影响节点、连接和业务输出；节点函数不存在或画布离线时说明具体问题。`,
  configRules: [],
  components: Object.fromEntries([
    "addNode", "moveNodes", "renameNodes", "nodeTools", "connectNodes",
    "deleteEdges", "selectNodes", "arrangeCanvas", "fitCanvas",
  ].map(name => [name, "src/nodeFocusCard.vue"])),
}, import.meta.url);
