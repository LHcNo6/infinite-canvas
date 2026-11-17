# 安泰信 Seedance Fast 与 Seedream Lite 接入

日期：2026-11-16。

## 实际行为

- 安泰信适配器升级至 `4.2.0`，加入 `seedance-2.0-video-fast-enhance` 和 `seedream-5.0-lite`；Lite 从原开发数据目录中的待适配条目更新为可配置模型。
- Fast 支持文生视频、首帧与首尾帧、多模态参考、Base64 图片及 asset 引用，提供 4–15 秒或智能时长、480p/720p、音频、水印及请求尾帧 URL 开关。使用专用 `/v1/video/generations` 提交并按同一 ID 轮询，不自动重复创建任务。
- Lite 支持 2K/3K、最多 14 张参考图、1–4 张输出；共用图片请求与本地保存流程，并接受日期版本别名 `seedream-5-0-lite-260128`。图片比例仍作为提示词构图要求。
- 图片参数面板沿用 Seedream 比例提示；视频参数面板识别 Fast 的智能时长和比例覆盖，保持摘要与实际请求一致。

## 关键实现

- `packages/providers/src/media/antaixin.ts`：模型列表、Lite 参数范围、Fast 专用任务 URL、图片内联传输、asset 校验、音频/水印/尾帧参数及轮询。复用既有请求和失败处理，不添加依赖或测试模块。
- `packages/nodes/imageGenerationNode/src/components/generationSettings.vue`、`packages/nodes/videoGenerationNode/src/components/generationSettings.vue`：新模型参数提示及摘要。
- [安泰信媒体模型维护说明](../antaixinModels.md)：持续维护模型能力、安装同步和未验证边界。
- 依据：[安泰信官方 API Reference](https://www.antaixin.ai/api-docs) 的 BytePlus Seedance 2.0 Fast Enhance 与 seedream-5.0-lite 页面，已通过 Ego Lite 只读核对提交/轮询示例。

## 验证与本地交付

- 适配器独立 `tsc --noEmit` 通过；Server、图片节点、视频节点现有 `typecheck` 均通过。
- Server 构建通过，提供方源码已同步至 `build/providers/media/antaixin.ts`；两个节点的开发构建通过，`build/nodes` 与 `data/nodes` 对应文件 SHA-256 一致。
- 同步安装适配器时保留原有模型列表（25 → 26 项）和现有账号配置，原适配器备份于本机临时目录。未改变默认模型选择或用户画布。
- 已确认两个本地工作区 Agent 会话空闲，并检查媒体任务结束后重启 Server；Vite 已重启。`http://localhost:3000/` 与 `http://localhost:5173/` 返回 HTTP 200。
- 运行中 `/api/ai/media/models` 返回两个模型及正确的分辨率、时长、参考模式、音频与高级参数；设置页显示安泰信 v4.2.0 和 26 个模型，编辑器包含两个模型。
- 节点产物通过 `/api/nodes/files` 可访问；`git diff --check` 通过。

## 未验证与兼容边界

未调用收费生成，未验证真实视频/图片结果、等待耗时、音轨、首尾帧、多模态、asset 访问权限、图片返回数量和上游计费。Fast 节点当前配置 9 图、3 视频、3 音频上限，最终能力由上游校验；`return_last_frame` 只请求上游返回，不另存尾帧 URL。Lite 水印能力尚未确认，保持禁止开启。图片 asset 引用只支持适配器 URL 入参，未增加专用节点素材管理 UI。

其他用户数据目录不会自动覆盖安装；要使用这些能力，需更新各自已安装的供应商文件。未修改或构建桌面/移动端，未推送远程仓库。
