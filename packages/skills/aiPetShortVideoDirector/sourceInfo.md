# AI Pet Short Video Director 来源与适配

- 来源：用户指定的 `ai-pet-short-video-director` 1.0.0，作者 Balance0014，MIT License。
- 来源入口 SHA-256：`bbc24ce322ba5d9d674c8be2b8bb1ee78661c797ae469f761e7a2d5c0bbf621f`。
- 平台名称：`aiPetShortVideoDirector`，使用无限画布的小驼峰命名；提供中文和英文入口，平台适配版本 1.0.1，上游来源版本仍为 1.0.0。
- `references/story.md`、`direction.md`、`generation.md`、`review.md` 保留来源英文方法正文；版权与许可完整保留在 `license.txt`。
- 入口按无限画布的职责边界重新组织：导演提供创作方法，调用工作流负责实际模型适配、节点、授权、生成和失败恢复；不递归调用工作流。
- 平台 1.0.1 增加家庭小糗事调用约定、逐镜预算与道具连续性，并明确该流程 Seedance 2.5 由 `sd25-pe` 定稿；不修改来源方法正文或上游版本。
- 可选收据改为读取平台制作清单的约定。未引入原包的 Python 收据校验、包检查脚本、评估文件、展示资产与安装说明，不要求新增运行时或重复台账。
- 参考中的拆段、编辑和修订是创作建议，不开通工具、增加调用或覆盖调用方的单次生成及用户授权限制。
- 入口与导演资料可读取不等于完成了真实 Agent 创作、付费生成或成片质量验证。

No remote repository or upstream commit was independently verified for this local source package. The source entry fingerprint identifies the material used; it does not claim an upstream release audit.
