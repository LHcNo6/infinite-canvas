# 本机 Bun 查找与开发服务

日期：2026-11-17

当前 Codex shell 的 PATH 不包含应用内 Bun，`command -v bun` 失败；检查确认 `/Applications/toonflow.app/Contents/MacOS/bun --version` 返回 1.4.0。项目声明 1.4.3，前者可用于本次验证但不等同于项目声明版本。`AGENTS.md` 增加本机查找入口，`LOCAL_DEVELOPMENT.md` 记录路径、命令和版本边界；未安装或修改桌面应用。

将该目录临时加入命令 PATH 后，服务端类型检查和构建通过。沙箱中启动 Web 监听返回 EPERM；在允许监听的环境启动 Web 和 Server 后，网页返回 HTTP 200，代理技能接口返回新技能和适配器的预期版本。验证未覆盖实际媒体生成或成片质量。
