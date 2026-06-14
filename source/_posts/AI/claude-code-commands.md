---
title: Claude Code 命令大全：CLI、斜杠命令、快捷键与配置
categories: [ AI ]
date: 2026-06-14 13:21:34
description: 'Claude Code 全部命令的模块化参考手册，覆盖 CLI 命令、斜杠命令、CLI 标志、键盘快捷键、权限模式、配置系统、记忆系统、MCP 集成、Hooks 和子代理。'
tags: [ claude-code, ai, cli ]
permalink: /ai/claude-code-commands/
math: true
---

# Claude Code 命令大全

Claude Code 的命令分三种：**CLI 命令**（终端里敲的）、**斜杠命令**（交互模式里敲的 `/xxx`）、**键盘快捷键**。这篇文章把它们全部整理出来，按模块分类，重要命令会解释清楚怎么用。

> 信息来源：[code.claude.com/docs](https://code.claude.com/docs/en/cli-reference.md)

---

## 命令树总览

```
Claude Code 命令
├── CLI 命令（终端中使用）
│   ├── 启动与会话
│   ├── 认证
│   ├── 后台会话管理
│   ├── MCP 与插件
│   └── 工具命令
├── 斜杠命令（交互模式中使用）
│   ├── 会话管理
│   ├── 模型与推理
│   ├── 权限与配置
│   ├── 记忆与上下文
│   ├── MCP 与集成
│   ├── 代码审查与 Diff
│   ├── Agent 与并行
│   ├── 技能与插件
│   ├── UI 与显示
│   ├── 辅助命令
│   └── 其他
├── CLI 标志（启动参数）
│   ├── 会话控制
│   ├── 模型与推理
│   ├── 权限
│   ├── 系统提示词
│   ├── 输出格式
│   ├── MCP 配置
│   ├── Agent
│   ├── 调试
│   └── 其他
├── 键盘快捷键
│   ├── 通用控制
│   ├── 文本编辑
│   ├── 多行输入
│   └── 转录查看器
├── 权限模式
├── 配置系统
├── 记忆系统
├── MCP 集成
├── Hooks 系统
├── 子代理
└── 环境变量
```

---

## CLI 命令

在终端中直接使用的命令，不进入交互模式。

### 启动与会话

| 命令 | 说明 |
|------|------|
| `claude` | 启动交互式会话 |
| `claude "query"` | 带初始 prompt 启动会话 |
| `claude -p "query"` | Print 模式：执行查询后退出，不进入交互 |
| `cat file \| claude -p "query"` | 管道输入，处理文件内容 |
| `claude -c` | 继续当前目录下最近一次对话 |
| `claude -c -p "query"` | 继续最近对话，通过 SDK 执行 |
| `claude -r "<session>" "query"` | 恢复指定会话（ID 或名称） |
| `claude update` | 更新到最新版本 |
| `claude install [version]` | 安装或重装原生二进制（`stable`、`latest` 或版本号） |

`claude -p` 是最常用的非交互用法。写脚本、做 CI 集成的时候用它：

```bash
# 让 Claude 解释一段代码
cat src/main.py | claude -p "解释这段代码的作用"

# 直接提问
claude -p "用 Java 写一个快速排序"
```

### 认证

| 命令 | 说明 |
|------|------|
| `claude auth login` | 登录。支持 `--email`、`--sso`、`--console` |
| `claude auth logout` | 登出 |
| `claude auth status` | 查看认证状态（JSON 格式），`--text` 输出人类可读 |

### 后台会话管理

Claude Code 支持后台会话——让 Agent 在后台跑着，你可以继续干别的事。

| 命令 | 说明 |
|------|------|
| `claude agents` | 打开 Agent 视图，查看所有后台会话 |
| `claude attach <id>` | 把后台会话接到当前终端 |
| `claude logs <id>` | 查看后台会话的最近输出 |
| `claude stop <id>` | 停止后台会话（别名：`claude kill`） |
| `claude respawn <id>` | 重启后台会话，`--all` 重启全部 |
| `claude rm <id>` | 从列表中移除后台会话 |
| `claude daemon status` | 查看后台会话管理器状态 |
| `claude daemon stop --any` | 停止管理器，`--keep-workers` 保留运行中的会话 |

### MCP 与插件

| 命令 | 说明 |
|------|------|
| `claude mcp` | 配置 MCP 服务器 |
| `claude plugin` | 管理插件。子命令：`install`、`list`、`enable`、`disable` |

### 工具命令

| 命令 | 说明 |
|------|------|
| `claude project purge [path]` | 删除项目的全部本地状态。`--dry-run` 预览 |
| `claude setup-token` | 生成长期 OAuth token，用于 CI/脚本 |
| `claude remote-control` | 启动 Remote Control 服务器，`--name` 指定名称 |
| `claude ultrareview [target]` | 非交互式运行 ultrareview，`--json`、`--timeout` |
| `claude auto-mode defaults` | 打印内置 auto mode 分类规则（JSON） |
| `claude auto-mode config` | 打印生效的 auto mode 配置 |

---

## 斜杠命令

交互模式中使用的命令，以 `/` 开头。

### 会话管理

| 命令 | 说明 |
|------|------|
| `/clear` | 清空上下文，开始新对话。别名：`/reset`、`/new` |
| `/compact [instructions]` | 压缩上下文，释放空间 |
| `/resume [session]` | 恢复对话，可指定 ID/名称或打开选择器。别名：`/continue` |
| `/branch [name]` | 从当前对话分叉 |
| `/fork <directive>` | 生成一个继承完整对话的分叉子代理 |
| `/rename [name]` | 重命名当前会话 |
| `/exit` | 退出。别名：`/quit` |
| `/export [filename]` | 导出对话为纯文本 |
| `/rewind` | 回退对话和/或代码到之前的状态。别名：`/checkpoint`、`/undo` |
| `/teleport` | 把 Web 会话拉到本地终端。别名：`/tp` |
| `/recap` | 生成一行会话摘要 |

**`/compact` 是你最常用的命令之一。** Claude Code 的上下文窗口有限，长对话会把窗口塞满。`/compact` 让 Claude 把之前的对话压缩成摘要，腾出空间继续聊。你也可以给它指令：

```
/compact 保留所有关于数据库迁移的讨论
```

**`/rewind` 很实用但很多人不知道。** 如果 Claude 改了一堆代码但你发现方向不对，`/rewind` 可以回退到之前的某个点，不用手动 git reset。

### 模型与推理

| 命令 | 说明 |
|------|------|
| `/model [model]` | 切换模型。输入 `s` 只切换当前会话 |
| `/effort [level\|auto]` | 设置推理力度：`low`、`medium`、`high`、`xhigh`、`max`、`ultracode`、`auto` |
| `/advisor [model\|off]` | 启用/关闭 advisor 工具 |
| `/fast [on\|off]` | 切换快速模式 |

**`/effort` 控制 Claude 思考的深度。** `low` 最快最便宜，适合简单问答；`max` 最慢最贵但推理最深，适合复杂架构设计。`auto` 让 Claude 自己判断。日常开发用 `medium` 或 `high` 就够了。

### 权限与配置

| 命令 | 说明 |
|------|------|
| `/permissions` | 管理 allow/ask/deny 规则。别名：`/allowed-tools` |
| `/config` | 打开设置界面。别名：`/settings` |
| `/login` | 登录 Anthropic 账号 |
| `/logout` | 登出 |
| `/status` | 查看版本、模型、账号、连接状态 |
| `/sandbox` | 切换沙箱模式 |
| `/privacy-settings` | 查看/更新隐私设置（Pro/Max 用户） |

### 记忆与上下文

| 命令 | 说明 |
|------|------|
| `/memory` | 编辑 CLAUDE.md 文件，切换 auto-memory，查看自动记忆条目 |
| `/context [all]` | 可视化上下文使用情况（彩色网格） |
| `/init` | 初始化项目的 CLAUDE.md 指南 |
| `/insights` | 生成分析 Claude Code 使用情况的报告 |

**`/context` 帮你理解上下文还剩多少空间。** 它会用彩色网格显示各部分内容占比——系统提示词、CLAUDE.md、对话历史、工具输出各占了多少。快满的时候就知道该 `/compact` 了。

### MCP 与集成

| 命令 | 说明 |
|------|------|
| `/mcp [reconnect\|enable\|disable]` | 管理 MCP 服务器连接 |
| `/ide` | 管理 IDE 集成 |
| `/chrome` | 配置 Chrome 集成 |
| `/terminal-setup` | 配置终端键绑定 |

### 代码审查与 Diff

| 命令 | 说明 |
|------|------|
| `/diff` | 交互式 diff 查看器，查看未提交的更改和每轮 diff |
| `/code-review [level] [--fix] [--comment] [target]` | 审查当前 diff 的 bug 和可清理项 |
| `/simplify [target]` | 审查已修改代码的清理机会并修复 |
| `/review [PR]` | 本地审查 Pull Request |
| `/security-review` | 分析待提交更改的安全漏洞 |
| `/ultrareview [PR]` | 在云端沙箱中做深度多代理审查 |

**`/diff` 是提交前必看的。** 它不只是 `git diff`——它能按每轮对话显示 Claude 做了哪些改动，方便你逐步审查。如果发现某轮改动有问题，直接 `/rewind` 回退到那轮之前。

### Agent 与并行

| 命令 | 说明 |
|------|------|
| `/agents` | 管理 Agent 配置 |
| `/batch <instruction>` | 编排大规模并行变更，每个 worktree 一个子代理 |
| `/background [prompt]` | 把当前会话分离为后台 Agent。别名：`/bg` |
| `/tasks` | 查看/管理后台任务。别名：`/bashes` |
| `/stop` | 停止当前后台会话 |
| `/workflows` | 查看工作流进度 |

**`/batch` 是处理大规模变更的利器。** 比如"给所有微服务添加健康检查端点"——`/batch` 会把任务拆成 5-30 个单元，每个在独立的 worktree 里跑一个子代理并行处理。

### 技能与插件

| 命令 | 说明 |
|------|------|
| `/skills` | 列出可用技能 |
| `/plugin [subcommand]` | 管理插件 |
| `/reload-plugins [--force]` | 重载所有活跃插件 |
| `/reload-skills` | 重新扫描技能目录 |
| `/claude-api [migrate\|managed-agents-onboard]` | 加载 Claude API 参考资料 |

### UI 与显示

| 命令 | 说明 |
|------|------|
| `/theme` | 切换颜色主题 |
| `/tui [default\|fullscreen]` | 设置终端 UI 渲染器 |
| `/focus` | 切换专注视图（仅 fullscreen） |
| `/color [color\|default]` | 设置提示栏颜色 |
| `/scroll-speed` | 调整鼠标滚轮速度（仅 fullscreen） |
| `/statusline` | 配置状态栏 |
| `/keybindings` | 打开键盘快捷键配置文件 |
| `/powerup` | 通过交互式课程发现功能 |

### 辅助命令

| 命令 | 说明 |
|------|------|
| `/btw <question>` | 问一个不进入对话历史的旁问 |
| `/goal [condition\|clear]` | 设定目标，Claude 会持续工作直到条件满足 |
| `/plan [description]` | 进入计划模式 |
| `/loop [interval] [prompt]` | 循环执行 prompt。别名：`/proactive` |
| `/schedule [description]` | 在云端创建定时任务。别名：`/routines` |

**`/btw` 的使用场景：** 你在让 Claude 重构代码，突然想问个不相关的问题。用 `/btw` 问，不会污染当前对话的上下文。

**`/goal` 很强大：** 比如 `/goal 所有测试通过`，Claude 会自动运行测试、分析失败原因、修复代码、再运行测试，循环直到全部通过。

### 其他

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助和可用命令 |
| `/usage` | 查看会话费用、计划用量、活动统计。别名：`/cost`、`/stats` |
| `/usage-credits` | 配置用量额度 |
| `/copy [N]` | 复制最后一条助手回复到剪贴板 |
| `/add-dir <path>` | 添加工作目录 |
| `/cd <path>` | 切换会话的工作目录 |
| `/run` | 启动并驱动项目应用查看更改效果 |
| `/verify` | 通过构建和运行确认代码变更有效 |
| `/run-skill-generator` | 为 `/run` 和 `/verify` 生成项目级技能 |
| `/heapdump` | 写入 JavaScript 堆快照，用于内存诊断 |
| `/release-notes` | 在交互式版本选择器中查看更新日志 |
| `/radio` | 打开 Claude FM lo-fi 电台 |
| `/stickers` | 订购 Claude Code 贴纸 |
| `/mobile` | 显示移动端 App 二维码。别名：`/ios`、`/android` |
| `/desktop` | 在桌面端 App 继续会话。别名：`/app` |
| `/upgrade` | 打开升级页面 |
| `/passes` | 分享一周免费 Claude Code |
| `/autofix-pr [prompt]` | 监听 PR 并自动修复 CI 失败 |
| `/remote-control` | 让会话可被远程控制。别名：`/rc` |
| `/remote-env` | 选择云端 Agent 的默认环境 |
| `/web-setup` | 连接 GitHub 账号到 Web 版 Claude Code |
| `/install-github-app` | 设置 Claude GitHub Actions App |
| `/install-slack-app` | 安装 Claude Slack App |
| `/setup-bedrock` | 配置 Amazon Bedrock |
| `/setup-vertex` | 配置 Google Vertex AI |
| `/ultraplan <prompt>` | 在 ultraplan 会话中起草计划 |
| `/hooks` | 查看 Hooks 配置 |
| `/fewer-permission-prompts` | 扫描历史记录，把常用工具加入允许列表 |
| `/debug [description]` | 启用调试日志并排查问题 |
| `/doctor` | 诊断安装和配置问题 |
| `/feedback [report]` | 提交反馈或报告 bug。别名：`/bug`、`/share` |
| `/team-onboarding` | 生成团队入职指南 |

---

## CLI 标志

启动 `claude` 时传入的参数。

### 会话控制

| 标志 | 说明 |
|------|------|
| `--continue`, `-c` | 加载当前目录最近一次对话 |
| `--resume`, `-r` | 按 ID、名称恢复会话，或打开选择器 |
| `--fork-session` | 恢复时创建新会话 ID 而不是复用原会话 |
| `--session-id` | 使用指定会话 ID（必须是合法 UUID） |
| `--name`, `-n` | 设置会话显示名称 |
| `--from-pr` | 恢复与指定 PR 关联的会话 |
| `--teleport` | 在本地终端恢复 Web 会话 |
| `--bg` | 作为后台 Agent 启动，立即返回 |
| `--exec` | 以 PTY 后台任务运行 shell 命令（配合 `--bg`） |

### 模型与推理

| 标志 | 说明 |
|------|------|
| `--model` | 设置模型：`sonnet`、`opus`、`haiku`、`fable` 或完整模型 ID |
| `--effort` | 推理力度：`low`、`medium`、`high`、`xhigh`、`max` |
| `--advisor <model>` | 启用服务端 advisor：`opus`、`sonnet`、`fable` 或模型 ID |
| `--fallback-model` | 主模型过载时的降级链（逗号分隔） |

### 权限

| 标志 | 说明 |
|------|------|
| `--permission-mode` | 权限模式：`default`、`acceptEdits`、`plan`、`auto`、`dontAsk`、`bypassPermissions` |
| `--dangerously-skip-permissions` | 等同于 `--permission-mode bypassPermissions` |
| `--allow-dangerously-skip-permissions` | 把 `bypassPermissions` 加入 Shift+Tab 循环 |
| `--allowedTools` | 无需提示即可执行的工具（支持通配符） |
| `--disallowedTools` | 拒绝规则；裸工具名直接从上下文移除 |
| `--tools` | 限制可用的内置工具：`"Bash,Edit,Read"` |
| `--permission-prompt-tool` | 非交互模式下处理权限提示的 MCP 工具 |

### 系统提示词

| 标志 | 说明 |
|------|------|
| `--system-prompt` | 替换整个系统提示词 |
| `--system-prompt-file` | 用文件内容替换系统提示词 |
| `--append-system-prompt` | 在默认系统提示词末尾追加内容 |
| `--append-system-prompt-file` | 追加文件内容到系统提示词 |
| `--exclude-dynamic-system-prompt-sections` | 把机器相关的部分移到第一条用户消息（提升缓存命中率） |

### 输出格式

| 标志 | 说明 |
|------|------|
| `--print`, `-p` | Print 模式，不进入交互 |
| `--output-format` | 输出格式：`text`、`json`、`stream-json` |
| `--input-format` | 输入格式：`text`、`stream-json` |
| `--json-schema` | 按 JSON Schema 校验输出（仅 print 模式） |
| `--verbose` | 详细日志，完整逐轮输出 |
| `--prompt-suggestions` | 每轮结束后输出 prompt 建议（需 `stream-json` + `--verbose`） |

### MCP 配置

| 标志 | 说明 |
|------|------|
| `--mcp-config` | 从 JSON 文件或字符串加载 MCP 服务器 |
| `--strict-mcp-config` | 只用 `--mcp-config` 指定的服务器，忽略其他所有 |

### Agent 与子代理

| 标志 | 说明 |
|------|------|
| `--agent` | 指定会话的 Agent |
| `--agents` | 通过 JSON 动态定义自定义子代理 |
| `--teammate-mode` | Agent 团队显示：`auto`、`in-process`、`tmux` |

### 目录与文件

| 标志 | 说明 |
|------|------|
| `--add-dir` | 添加额外的工作目录 |
| `--worktree`, `-w` | 在隔离的 git worktree 中启动 |
| `--tmux` | 为 worktree 创建 tmux 会话（需 `--worktree`） |

### 调试

| 标志 | 说明 |
|------|------|
| `--debug` | 启用调试模式，支持类别过滤：`"api,hooks"`、`"!statsig"` |
| `--debug-file <path>` | 把调试日志写入指定文件 |
| `--safe-mode` | 禁用所有自定义配置启动（排障用） |
| `--bare` | 最小模式：跳过 hooks、skills、插件、MCP、memory、CLAUDE.md 的自动发现 |
| `--init` | 运行 Setup hooks 的 `init` matcher（仅 print 模式） |
| `--init-only` | 运行 Setup 和 SessionStart hooks 后退出 |
| `--maintenance` | 运行 Setup hooks 的 `maintenance` matcher（仅 print 模式） |

### 配置

| 标志 | 说明 |
|------|------|
| `--settings` | 指向 settings JSON 文件或内联 JSON 字符串 |
| `--setting-sources` | 逗号分隔的设置来源：`user`、`project`、`local` |
| `--plugin-dir` | 从目录或 `.zip` 加载插件 |
| `--plugin-url` | 从 URL 拉取插件 `.zip` |
| `--disable-slash-commands` | 禁用所有技能和命令 |

### Hooks 与事件

| 标志 | 说明 |
|------|------|
| `--include-hook-events` | 输出中包含所有 hook 生命周期事件（需 `stream-json`） |
| `--include-partial-messages` | 包含部分流式事件（需 `--print` + `stream-json`） |
| `--replay-user-messages` | 在 stdout 上重新发送 stdin 的用户消息 |

### 远程与 Web

| 标志 | 说明 |
|------|------|
| `--remote` | 在 claude.ai 创建新 Web 会话 |
| `--remote-control`, `--rc` | 启用 Remote Control 的交互会话 |
| `--channels` | 监听哪些 MCP 服务器的通道通知 |

### 浏览器集成

| 标志 | 说明 |
|------|------|
| `--chrome` | 启用 Chrome 集成 |
| `--no-chrome` | 禁用 Chrome 集成 |
| `--ide` | 启动时自动连接可用的 IDE |

### 其他

| 标志 | 说明 |
|------|------|
| `--version`, `-v` | 输出版本号 |
| `--betas` | API 请求的 beta header（仅 API key 用户） |
| `--max-turns` | 限制 Agent 轮次（仅 print 模式） |
| `--max-budget-usd` | 达到金额上限后停止（仅 print 模式） |
| `--no-session-persistence` | 禁用会话持久化（仅 print 模式） |

### 常用组合

```bash
# 用 Sonnet 模型快速问答
claude -p "解释 TCP 三次握手" --model sonnet

# 非交互模式，输出 JSON
claude -p "分析这段代码" --output-format json

# 后台启动，自动批准文件编辑
claude --bg --permission-mode acceptEdits

# 自定义系统提示词 + 指定模型
claude --system-prompt "你是一个 Python 专家" --model opus

# CI 中使用，跳过权限提示
claude -p "检查代码风格" --permission-mode bypassPermissions

# 从 PR 恢复会话
claude --from-pr 123
```

---

## 键盘快捷键

### 通用控制

| 快捷键 | 说明 |
|--------|------|
| `Ctrl+C` | 中断，或清空输入（按两次退出） |
| `Ctrl+D` | 退出 Claude Code |
| `Ctrl+G` 或 `Ctrl+X Ctrl+E` | 在默认编辑器中打开 |
| `Ctrl+L` | 重绘屏幕 |
| `Ctrl+O` | 切换转录查看器 |
| `Ctrl+R` | 反向搜索命令历史 |
| `Ctrl+V` / `Cmd+V` / `Alt+V` | 从剪贴板粘贴图片 |
| `Ctrl+B` | 把运行中的任务移到后台 |
| `Ctrl+T` | 切换任务列表 |
| `Ctrl+X Ctrl+K` | 停止所有后台子代理 |
| `Esc` | 中断 Claude |
| `Esc` + `Esc` | 清空输入草稿，输入为空时打开 rewind 菜单 |
| `Shift+Tab` | 循环切换权限模式 |
| `Alt+P` | 切换模型 |
| `Alt+T` | 切换扩展推理 |
| `Alt+O` | 切换快速模式 |
| `Left/Right` | 在对话框标签页之间切换 |
| `Up/Down` 或 `Ctrl+P`/`Ctrl+N` | 移动光标或浏览命令历史 |

### 文本编辑

| 快捷键 | 说明 |
|--------|------|
| `Ctrl+A` | 光标移到行首 |
| `Ctrl+E` | 光标移到行尾 |
| `Ctrl+K` | 删除到行尾 |
| `Ctrl+U` | 删除到行首 |
| `Ctrl+W` | 删除前一个单词 |
| `Ctrl+Y` | 粘贴已删除的文本 |
| `Alt+Y`（在 Ctrl+Y 之后） | 循环粘贴历史 |
| `Alt+B` | 光标后移一个单词 |
| `Alt+F` | 光标前移一个单词 |

### 多行输入

| 方式 | 快捷键 |
|------|--------|
| 快速换行 | `\` + `Enter` |
| Option 键 | `Option+Enter` |
| Shift | `Shift+Enter` |
| 控制序列 | `Ctrl+J` |
| 粘贴模式 | 直接粘贴多行文本 |

### 快捷前缀

| 前缀 | 说明 |
|------|------|
| `/` 开头 | 输入斜杠命令 |
| `!` 开头 | Shell 模式，直接执行命令 |
| `@` | 文件路径自动补全 |

### 转录查看器（Ctrl+O 打开后）

| 快捷键 | 说明 |
|--------|------|
| `?` | 切换快捷键帮助（全屏） |
| `{` / `}` | 跳到上一个/下一个用户 prompt |
| `Ctrl+E` | 切换显示全部内容 |
| `[` | 把对话写入终端 scrollback |
| `v` | 把对话写入临时文件并在编辑器中打开 |
| `q`、`Ctrl+C`、`Esc` | 退出转录查看 |

### 语音输入

| 快捷键 | 说明 |
|--------|------|
| 长按或点按 `Space` | 语音输入 |

---

## 权限模式

Claude Code 有 6 种权限模式，控制 Claude 能做什么、不能做什么。

| 模式 | 说明 |
|------|------|
| `default` | 标准模式：每个工具首次使用时提示授权 |
| `acceptEdits` | 自动接受文件编辑和工作目录内的常见文件系统命令 |
| `plan` | 计划模式：只读文件和只读 shell 命令，不编辑源码 |
| `auto` | 自动批准工具调用，后台安全检查（研究预览） |
| `dontAsk` | 除非通过 `/permissions` 预先批准，否则自动拒绝 |
| `bypassPermissions` | 跳过所有权限提示（`rm -rf /` 仍会提示） |

**`Shift+Tab` 可以在会话中循环切换模式。** 比如你在 `default` 模式下，按一下变成 `acceptEdits`，再按变成 `plan`。

**什么时候用什么模式？**

- **日常开发**：`default` 或 `acceptEdits`
- **让 Claude 自己跑**：`auto`（但要注意安全）
- **只想看方案不动代码**：`plan`
- **CI/脚本**：`bypassPermissions`（配合 `--allowedTools` 限制范围）

在 settings 中可以禁用特定模式：

```json
{
  "permissions": {
    "disableBypassPermissionsMode": "disable",
    "disableAutoMode": "disable"
  }
}
```

---

## 配置系统

### 配置优先级（从高到低）

1. **托管设置**（服务端管理、plist/registry、系统 `managed-settings.json`）
2. **CLI 参数**（临时会话覆盖）
3. **本地项目设置**（`.claude/settings.local.json`，gitignore）
4. **共享项目设置**（`.claude/settings.json`，提交到 git）
5. **用户设置**（`~/.claude/settings.json`）

### 配置文件位置

| 作用域 | 路径 | 共享？ |
|--------|------|--------|
| 用户 | `~/.claude/settings.json`、`~/.claude/CLAUDE.md` | 仅自己 |
| 项目（共享） | `.claude/settings.json`、`CLAUDE.md`、`.mcp.json` | 团队通过 git |
| 项目（本地） | `.claude/settings.local.json`、`CLAUDE.local.md` | 仅自己（gitignore） |
| 托管 | macOS `/Library/Application Support/ClaudeCode/managed-settings.json`、Linux `/etc/claude-code/managed-settings.json`、Windows `C:\Program Files\ClaudeCode\managed-settings.json` | 所有用户 |

### 关键配置项

```json
{
  "model": "claude-sonnet-4-6",
  "effortLevel": "high",
  "defaultShell": "/bin/bash",
  "editorMode": "default",
  "language": "zh-CN",
  "autoMemoryEnabled": true,
  "fallbackModel": "claude-haiku-4-5-20251001",
  "cleanupPeriodDays": 30,
  "permissions": {
    "allow": ["Bash(npm test)", "Edit"],
    "deny": ["Bash(rm -rf *)"]
  },
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "type": "command",
        "command": "echo 'Tool executed'"
      }
    ]
  }
}
```

### CLAUDE.md 文件体系

| 作用域 | 路径 | 说明 |
|--------|------|------|
| 用户 | `~/.claude/CLAUDE.md` | 全局指令 |
| 项目（共享） | `./CLAUDE.md` 或 `./.claude/CLAUDE.md` | 团队共享的项目指令 |
| 项目（本地） | `./.claude/CLAUDE.local.md` | 个人的项目指令（gitignore） |
| 规则目录 | `.claude/rules/*.md` | 按路径作用域的规则文件 |

CLAUDE.md 支持 `@path/to/file` 语法导入其他文件，最多 4 层嵌套。

---

## 记忆系统

### CLAUDE.md（用户手写）

你写的指令文件，Claude 每次启动都会读。适合放项目约定、编码规范、架构说明。

### Auto Memory（Claude 自动写）

Claude 在对话中学到的信息会自动存到 `~/.claude/projects/<project>/memory/` 目录下：

- `MEMORY.md` 是索引文件（会话启动时加载前 200 行或 25KB）
- 具体内容按需加载
- 通过 `/memory` 或 `autoMemoryEnabled` 设置切换
- 环境变量 `CLAUDE_CODE_DISABLE_AUTO_MEMORY=1` 可完全禁用

---

## MCP 集成

### 配置方式

1. 项目根目录放 `.mcp.json`
2. `claude mcp add` CLI 命令
3. `--mcp-config` 标志
4. `settings.json` 中的 `enabledMcpjsonServers` / `disabledMcpjsonServers`
5. 托管 MCP：`allowedMcpServers` / `deniedMcpServers`

### MCP 权限规则

```
mcp__<server>           # 匹配服务器的所有工具
mcp__<server>__*        # 同上
mcp__<server>__<tool>   # 匹配特定工具
```

### MCP Prompts 作为命令

MCP 服务器可以暴露 prompts，显示为 `/mcp__<server>__<prompt>` 命令。

---

## Hooks 系统

Hooks 让你在 Claude Code 的生命周期事件中插入自定义逻辑。有 30 个事件和 5 种 hook 类型。

### 常用事件

| 事件 | 触发时机 | 支持 Matcher |
|------|---------|-------------|
| `SessionStart` | 会话开始/恢复 | `startup`、`resume`、`clear`、`compact` |
| `UserPromptSubmit` | 用户提交 prompt | 否 |
| `PreToolUse` | 工具调用执行前 | 工具名 |
| `PostToolUse` | 工具调用成功后 | 工具名 |
| `Stop` | Claude 完成响应 | 否 |
| `SubagentStart` | 子代理启动 | Agent 类型 |
| `SubagentStop` | 子代理结束 | Agent 类型 |
| `PreCompact` | 上下文压缩前 | `manual`、`auto` |
| `PostCompact` | 上下文压缩后 | `manual`、`auto` |
| `SessionEnd` | 会话终止 | `clear`、`resume`、`logout` 等 |

### Hook 类型

| 类型 | 说明 |
|------|------|
| `command` | 运行 shell 命令 |
| `http` | 发送 HTTP 请求 |
| `mcp_tool` | 调用 MCP 工具 |
| `prompt` | 让 Claude 模型评估 |
| `agent` | 运行 Claude Agent 评估 |

### 退出码

| 退出码 | 含义 |
|--------|------|
| 0 | 成功，stdout 解析为 JSON |
| 2 | 阻塞错误，stderr 反馈给 Claude |
| 其他 | 非阻塞错误，继续执行 |

---

## 子代理

### 内置子代理

- **Explore**：只读的代码库探索 Agent
- **Plan**：设计方案的规划 Agent

### 自定义子代理

在 `.claude/agents/<name>.md` 中定义，使用 YAML frontmatter：

```yaml
---
description: 代码审查 Agent
allowed-tools: Read, Grep, Glob
model: sonnet
effort: high
---

你是一个代码审查专家。检查代码质量问题并给出改进建议。
```

### 权限规则

```
Agent(Explore)              # 匹配 Explore 子代理
Agent(Plan)                 # 匹配 Plan 子代理
Agent(my-custom-agent)      # 匹配自定义子代理
```

### 并行模式

| 命令 | 说明 |
|------|------|
| `/batch` | 把任务拆成 5-30 个单元，每个 worktree 一个子代理并行跑 |
| `/fork` | 生成继承完整对话的后台子代理 |
| `/background` | 把整个会话分离为后台 Agent |
| `claude agents` | Agent 视图，监控并行会话 |

---

## 环境变量

| 变量 | 用途 |
|------|------|
| `ANTHROPIC_API_KEY` | API Key 认证 |
| `ANTHROPIC_AUTH_TOKEN` | Auth Token |
| `ANTHROPIC_MODEL` | 覆盖会话模型 |
| `CLAUDE_CODE_ENABLE_TELEMETRY` | 启用遥测 |
| `CLAUDE_CODE_DISABLE_AUTO_MEMORY` | 禁用自动记忆 |
| `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS` | 禁用后台任务 |
| `CLAUDE_CODE_DISABLE_WORKFLOWS` | 禁用工作流 |
| `CLAUDE_CODE_DISABLE_BUNDLED_SKILLS` | 禁用内置技能 |
| `CLAUDE_CODE_DISABLE_AGENT_VIEW` | 禁用 Agent 视图 |
| `CLAUDE_CODE_EFFORT_LEVEL` | 覆盖推理力度 |
| `CLAUDE_CODE_USE_POWERSHELL_TOOL` | 启用 PowerShell 工具 |
| `CLAUDE_CODE_SKIP_PROMPT_HISTORY` | 禁用转录写入 |
| `CLAUDE_CODE_NEW_INIT` | 启用交互式多阶段 `/init` |
| `CLAUDE_CODE_SIMPLE` | `--bare` 模式设置 |
| `CLAUDE_CODE_SAFE_MODE` | `--safe-mode` 设置 |
| `MAX_THINKING_TOKENS` | 设为 `0` 禁用思考 |
| `DISABLE_AUTOUPDATER` | 禁用自动更新 |
| `NO_COLOR` / `FORCE_COLOR` | 控制界面颜色 |

---

## 特殊模式

### Vim 模式

通过 `/config` → Editor mode → `vim` 启用。支持完整的 NORMAL 模式导航（`h/j/k/l`、`w/e/b`、`0/$`、`gg/G`）、编辑（`dd`、`cc`、`x`、`dw`、`yy`、`p`、`u`、`.`）、文本对象（`iw/aw`、`i"/a"`）、可视模式（`v`/`V`）和 f/F/t/T 动作。

### Shell 模式

输入前缀 `!` 直接执行 shell 命令，不经过 Claude。命令和输出会加入对话上下文。支持 `Ctrl+B` 移到后台，`Tab` 自动补全历史命令。

```
!git status
!npm test
!docker ps
```

### 后台任务

Claude 可以在后台异步运行 bash 命令。`Ctrl+B` 把运行中的命令移到后台。退出时自动清理，输出超过 5GB 自动终止。环境变量 `CLAUDE_CODE_DISABLE_BACKGROUND_TASKS=1` 可禁用。

---

> **参考来源**：
> - [Claude Code CLI Reference](https://code.claude.com/docs/en/cli-reference)
> - [Claude Code Commands](https://code.claude.com/docs/en/commands)
> - [Claude Code Interactive Mode](https://code.claude.com/docs/en/interactive-mode)
> - [Claude Code Permissions](https://code.claude.com/docs/en/permissions)
> - [Claude Code Settings](https://code.claude.com/docs/en/settings)
> - [Claude Code Memory](https://code.claude.com/docs/en/memory)
> - [Claude Code Hooks](https://code.claude.com/docs/en/hooks)
> - [Claude Code MCP](https://code.claude.com/docs/en/mcp)
> - [Claude Code Sub-agents](https://code.claude.com/docs/en/sub-agents)
