# 安泰信媒体模型维护说明

本文维护安泰信模型发现与生成适配，最近于 2026-11-16 加入 Seedance 2.0 Fast Enhance 和 Seedream 5.0 Lite。运行版本、上游模型和账号权限可能变化，应以实际环境为准。

## 入口与数据流

- [安泰信适配器](../../packages/providers/src/media/antaixin.ts) 的 `modelsUrl` 指向 `https://www.antaixin.ai/v1/models`。媒体模型设置中的“获取模型”调用服务端刷新接口。
- [媒体供应商管理](../../apps/server/src/utils/media/provider.ts) 使用该供应商配置的 API Key 请求列表、校验响应并识别模型类型，保存时只替换供应商文件中的 `models` 字面量。文件版本和 API Key 在保存前会再次检查，避免覆盖并发修改。
- 对返回的同名模型，已有配置先合并，上游字段和 `modelInfo` 覆盖对应字段；未返回的能力字段沿用已有配置。刷新结果包含的每一种类型，会替换原列表中该类型的模型；其他类型保留。空列表或请求失败时不会保存。
- 已有数据目录中的 `providers/antaixin.ts` 不会在启动时自动被源码覆盖。此次已单独更新本开发工作区 `data/providers/antaixin.ts` 的列表地址和错误提示，保留原模型配置；其他数据目录或安装版须分别处理，不能直接假定已更新。`data/` 不纳入 Git。

## 分类与能力边界

2026-11-04 使用只读请求访问上述地址，账号返回 25 个模型；响应包含 `id` 和 `supported_endpoint_types`，但未提供完整模型能力和参数。数量不是固定值，也不代表这些模型的生成接口均已适配。

类型优先使用上游明确的 `type`、请求指定的类型和现有同名配置。安泰信的额外识别规则将 `openai-video` 及 `seedance-2.5-video` 归为视频；将 `image-generation` 及当前代码中识别的图片模型名称前缀归为图片。仅有 `openai` 标签并不足以确定媒体类型；未知名称且无明确类型的模型会跳过。名称匹配是启发式规则，后续应依据上游文档和真实响应维护，不应将它当作完整的多模态能力清单。

现有适配器支持 `seedream-5.0-pro`、`gpt-image-2.5-flare`、`gpt-image-2.5-sunburst`、`nano-banana-2`、`wan2.7-image-pro`、`grok-imagine-image-2.0`、`kling-image-o1` 图片生成，以及 `seedance-2.5-video`、`wan-3.0`、`minimax-h3` 视频生成。GPT Image 2.5 使用 `/v1/images/generations` 和 `/v1/images/edits`，参考图通过 multipart 上传；接口未声明独立画幅比例，只有 `1024x1024` 明确为方形。Nano Banana 2 使用 Gemini 请求结构；Wan 2.7 的 4k 和思考模式仅适用于文生图。图片结果会保存到工作区，节点显示第一张，其他结果可在节点历史中查看。

Wan 3.0 和 MiniMax H3 使用 `/v1/videos` 创建任务及同 ID 查询，不自动重复提交。视频和音频参考须提供 HTTPS 直链，并按顺序填写时长；本地不会验证直链实际内容与时长，也不会验证 Wan 3.0 图片透明通道。无原始 URL 的本地图片通过现有安泰信素材上传接口转换；该上传接口限制 10MB，Grok 会尝试压缩图片，视频参考图不会压缩。上游对链接可访问性和素材的最终校验仍可能失败。新识别且没有已有配置的模型标记为“生成协议待适配”。

## 操作与验证

### 2026-11-16：手动查询原视频任务

安泰信4.2.2新增`queryVideoTask`，仅GET已存在任务，支持Seedance 2.5、Fast、Wan 3.0及MiniMax H3。节点调用记录提供手动查询与查询回执；旧安泰信Seedance错误详情中的`task_...`编号可作为兼容来源。没有任务ID时明确提示无法查询，不重发创建接口。成功查询只保存结果地址，由用户另行下载；原记录的错误详情继续保留，已有本地结果不因查询失败而被删除。

对用户报告的`Service is busy or quota reached`任务进行了真实只读复查，仍返回`status=failed`、`error.code=GenerationFailed`，没有视频URL。此消息表示上游失败，不能区分平台繁忙和具体账户配额原因；重新查询不会重启原任务，也不能承诺免除原任务费用。详见[变更记录](changes/antaixinManualQuery20261116.md)。

### 2026-11-16：下载恢复及视频提交保护

适配器 `4.2.1` 对 Seedance 2.5 的本地图片、data 输入和公开 URL 图片，在上传/收费提交前检查宽高均为300–6000px；URL 图片需能被本机读取，读取最多30秒/100MB。压缩上传时保留最短边300px，不自动放大不合格素材。Fast 沿用其原有校验，asset 素材仍交上游核验，不能把2.5的错误当作Fast的完整尺寸规范。

视频获得任务 ID 后通过宿主回调先持久保存再轮询。提交的5xx/408保留有界、脱敏错误摘要及可用的Request ID/CF-Ray，状态标记为未知，不自动重复POST。任务ID未知时仍需平台核对是否受理/计费；本地修复不能修正上游计价或退款。

八次图片调用经后台截图确认均成功；本机失败发生在CloudFront下载。成品GET加入有限重试和未配置网络时的系统代理备用通路；URL成品先写入独立调用记录，可在重启后只下载恢复。详见[修复记录](changes/antaixinResultRecovery20261116.md)。

### 2026-11-16：BytePlus Fast 视频与 Lite 图片

适配器版本为 `4.2.0`，新增以下配置与请求分支；文档依据为[安泰信官方 API Reference](https://www.antaixin.ai/api-docs) 中对应的 BytePlus 模型页面。

| 模型 | 当前行为 |
| --- | --- |
| `seedance-2.0-video-fast-enhance` | 使用 `https://www.antaixin.ai/v1/video/generations` 提交，随后 GET 同一路径下的任务 ID；读取 `status=succeeded` 的 `content.video_url`。支持 4–15 秒、`duration=-1` 智能时长、480p/720p、可选音频、水印、首帧、首尾帧与多模态参考。 |
| `seedream-5.0-lite` | 使用 `https://images-api.antaixin.ai/api/v3/images/generations`，支持 2K/3K、1–4 张输出、最多 14 张参考图；适配器也接受 `seedream-5-0-lite-260128` 别名。成功后直接读取图片数组，实际返回数量可少于请求数量，沿用宿主下载保存逻辑。 |

Fast 使用 BytePlus `content` 数组，本地图片直接转为 data URL，不经过旧上传接口；适配器的图片、视频、音频 URL 输入均允许 `asset://asset-xxxxx`，图片还允许 data URL。单图模式映射为 `first_frame`，多图模式使用 `reference_image`，首尾帧不与其他参考混用。当前节点能力配置上限为 9 图、3 视频、3 音频；视频/音频本地文件仍需来源 URL 或在高级配置中按顺序提供公网 URL / asset 引用。图片 asset 引用可通过适配器 URL 输入传入，节点未增加 asset 选择器。Fast 不使用 Seedance 2.5 的视频延长、种子或帧率请求字段。

高级配置 `autoDuration` 映射为 `duration=-1`，参数摘要显示自动时长，并禁用手动时长选项；画幅覆盖及自适应比例同步到摘要。`return_last_frame` 仅传给上游，请求其在支持时返回尾帧 URL；宿主仍保存视频结果，不会额外保存这个 URL 或自动创建尾帧图片。需要本地尾帧时继续使用现有[尾帧提取](videoLastFrame.md)流程。

Lite 复用 Seedream 的 PNG/JPEG/WebP、每张 20MB、32–8000px 校验及 64MB 请求体上限；图片比例写入提示词，不承诺精确尺寸比例。未确认 Lite 水印能力，沿用 Seedream 禁用开启水印的约束。图片 POST 不自动重试；视频 POST 也只提交一次，已知任务 ID 后的暂时性网络/408/429/5xx 错误只重试同一任务 GET。

本地已保留原安装模型列表并更新 `data/providers/antaixin.ts`（25 → 26 项，Lite 原已有待适配条目），源码构建副本位于 `build/providers/media/antaixin.ts`；其他数据目录不会自动覆盖。图片和视频节点均完成开发产物同步，Web 与 Server 已重启。已通过适配器独立 TypeScript 检查、Server 和两个节点的类型检查与构建、运行时模型接口、网页和节点产物 HTTP 可访问性、Ego Lite 设置页展示核对。未执行收费生成，未验证真实首尾帧、多模态、asset 权限、尾帧 URL 和图片输出数量；未验证其他安装环境。

变更记录：[Fast 视频与 Lite 图片模型接入](changes/antaixinByteplusModels20261116.md)。

### 2026-11-04：模型列表发现验证

源码后端载入最新改动后，在媒体模型设置中配置安泰信 API Key，点击该供应商的“获取模型”；该操作会写入当前数据目录下的供应商文件。获取失败时检查服务端错误、账号权限和模型列表地址；更新文件后刷新设置页面，并检查节点模型列表。不要在文档或日志中记录 API Key。

本次已验证模型列表只读请求返回 HTTP 200 和 25 个条目，服务端 `typecheck`、`build` 和 `git diff --check` 通过。尚未验证应用内刷新及保存全链路、重新加载后的节点展示或新增模型的真实生成；未重启当时运行的服务，也未更新安装版。涉及付费生成的验收应单独记录实际请求、费用风险与结果。
