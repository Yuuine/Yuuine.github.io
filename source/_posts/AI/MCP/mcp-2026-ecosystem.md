---
title: MCP 2026 生态全景：规范、SDK、Registry 和 MCP Apps
categories: [ AI ]
date: 2026-06-15 01:15:09
description: '基于官方规范与 GitHub 仓库的一手调研，梳理 MCP 从 2024 年首版到 2026 年的生态演进：规范版本变更、三大 SDK 大版本、官方注册中心、交互式 UI 扩展与治理结构。'
tags: [ mcp, llm, agent ]
permalink: /ai/mcp/mcp-2026-ecosystem/
math: true
---

# MCP 2026 生态全景

如果你在 2024 年了解过 MCP，当时它就是一个基于 JSON-RPC 2.0 的工具调用协议——"AI 的 USB-C 接口"。

但到了 2026 年 6 月，MCP 的变化已经大到需要重新认识了。规范迭代了 8 个版本，三大 SDK 同时发大版本，有了官方的服务器注册中心，甚至能在聊天窗口里直接渲染交互式 UI。

这篇文章基于 MCP 官方规范站点和 GitHub 仓库的一手数据，把 MCP 到 2026 年变成了什么样子讲清楚。

> 之前的 [什么是 MCP？](/ai/mcp/introduceMCP/) 介绍了协议基础，本文是 2026 年的"更新补丁"。

---

## 规范版本：从 2024-10-07 到现在

MCP 规范用日期做版本号（YYYY-MM-DD），到现在一共 8 个版本：

| 版本 | 发布日期 | 说明 |
|------|---------|------|
| 2024-10-07 | 2024-11-06 | 首个公开版本，基础 JSON-RPC + stdio |
| 2024-11-05 | 2025-01-17 | 协议完善 |
| 2024-11-05-final | 2025-03-26 | 向后兼容补丁汇总 |
| 2025-03-26 | 2025-03-26 | **引入 Streamable HTTP** |
| 2025-06-18 | 2025-06-18 | 结构化输出等特性 |
| **2025-11-25** | **2025-11-25** | **当前最新稳定版**，OAuth 增强、Tasks、治理结构 |
| 2026-07-28-RC | 预发布 | 无状态化、MRTR、功能废弃（变化很大，后面单独讲） |

> 来源：[github.com/modelcontextprotocol/specification/releases](https://github.com/modelcontextprotocol/specification/releases)

几个关键节点：

**2025-03-26：Streamable HTTP 登场。** 在此之前远程传输用的是 HTTP+SSE，2025-03-26 换成了 Streamable HTTP——单个 HTTP 端点支持 POST 和 GET，服务端可以选择性地用 SSE 流式响应，还支持会话管理和断线重连。旧的 HTTP+SSE 在 2025-11-25 被正式废弃。

**2025-11-25：治理结构建立。** 这个版本不只是技术更新，它标志着 MCP 从"Anthropic 的项目"变成了"社区驱动的开放标准"。正式建立了治理结构（SEP-932）、工作组和兴趣小组机制（SEP-1302）、SDK 分级系统（SEP-1730）。具体治理细节后面单独讲。

> 来源：[2025-11-25 Changelog](https://modelcontextprotocol.io/specification/2025-11-25/changelog)

---

## Draft 版本：MCP 最大的一次"变脸"

2026-07-28-RC 是下一版规范的候选版本，草案已经在 [specification/draft](https://modelcontextprotocol.io/specification/draft) 公开了。这个版本的变化幅度远超此前任何一次更新，说它是 MCP 的"变脸"一点不过分。

### 无状态化（SEP-2575）

最炸裂的变化。当前版本里，客户端和服务器要先走一遍 `initialize`/`notifications/initialized` 握手建立会话，后面所有请求都依赖这个会话状态。新版本把这个握手干掉了。

之前：

```
Client → Server: InitializeRequest（带能力声明）
Server → Client: InitializeResponse（带服务器能力）
Client → Server: InitializedNotification
// 之后所有请求依赖会话
```

之后：

```
// 每个请求自带完整上下文，随发随走
Client → Server: 任意请求
  _meta:
    io.modelcontextprotocol/protocolVersion: "2026-07-28"
    io.modelcontextprotocol/clientInfo: {name: "...", version: "..."}
    io.modelcontextprotocol/clientCapabilities: {...}
```

新增了一个 `server/discover` RPC 方法，服务器必须实现，用来广播自己支持的协议版本和能力。

讲真，这个变化的影响比看起来大得多。无状态意味着 MCP 服务器可以像普通 HTTP API 一样部署和水平扩展，不再需要维护会话，每个请求都是独立的。对微服务架构来说简直是天作之合。

> 来源：[Draft Changelog - SEP-2575](https://modelcontextprotocol.io/specification/draft/changelog)

### 移除协议级会话（SEP-2567）

跟无状态化配套，`Mcp-Session-Id` HTTP header 直接移除。`tools/list`、`resources/list`、`prompts/list` 这些列表端点不再按连接变化。服务器如果需要跨调用的状态，得自己想办法——比如把状态句柄当普通工具参数传。

> 来源：[Draft Changelog - SEP-2567](https://modelcontextprotocol.io/specification/draft/changelog)

### MRTR 多往返请求模式（SEP-2322）

之前服务器想从客户端要额外信息（比如让用户选个目录、确认个操作），用的是 `roots/list`、`sampling/createMessage` 这些服务端发起的请求。新版本用 MRTR（Multi Round-Trip Requests）模式替换了这套机制。

MRTR 的思路是：服务器在响应里返回 `inputRequests`（我还需要什么信息），客户端在下一次请求里通过 `inputResponses` 给你。比之前"服务端反向调用客户端"的方式清晰多了。

> 来源：[Draft Changelog - SEP-2322](https://modelcontextprotocol.io/specification/draft/changelog)

### 功能废弃（SEP-2577、SEP-2596）

新版本废弃了一批功能：

| 废弃功能 | 为什么废弃 | 替代方案 |
|---------|-----------|---------|
| **Roots** | 使用率低，增加了协议复杂度 | 通过工具参数、资源 URI 或服务器配置传递 |
| **Sampling** | 服务端反向调用客户端 LLM 的模式太绕 | 直接集成 LLM 供应商 API |
| **Logging** | 和 OpenTelemetry 生态重叠 | stderr（stdio）或 OpenTelemetry |
| **HTTP+SSE 传输** | 被 Streamable HTTP 替代 | 迁移到 Streamable HTTP |

MCP 现在有了正式的功能生命周期管理：Active → Deprecated → Removed，废弃窗口最少 12 个月。老老实实迁移就好，不用慌。

> 来源：[Draft Changelog - SEP-2577](https://modelcontextprotocol.io/specification/draft/changelog)

### 其他值得留意的变化

- **Tasks 转为扩展**（SEP-2663）：从核心协议移出，变成 `io.modelcontextprotocol/tasks` 扩展。如果你没用过 Tasks，这条跟你没关系
- **缓存支持**（SEP-2549）：列表和读取操作的返回结果新增 `ttlMs`（新鲜度提示）和 `cacheScope`（`public`/`private`）字段。客户端可以缓存结果，减少不必要的请求
- **HTTP 标准化**（SEP-2243）：Streamable HTTP POST 请求必须带 `Mcp-Method`、`Mcp-Name` 标准 header，支持通过 `x-mcp-header` 从工具参数传自定义 header
- **OpenTelemetry 集成**（SEP-414）：`_meta` 里定义了 `traceparent`、`tracestate`、`baggage` 的传播约定。对可观测性有要求的团队可以接入了
- **扩展字段**：`ClientCapabilities` 和 `ServerCapabilities` 新增 `extensions` 字段，为未来的核心协议之外的可选扩展留了口子

> 来源：[Draft Changelog](https://modelcontextprotocol.io/specification/draft/changelog)

---

## SDK 生态：三大 SDK 同时发大版本

2026 年是 MCP SDK 的"大版本年"。

### TypeScript SDK

| 项目 | 信息 |
|------|------|
| 当前稳定版 | v1.27.2（2026-05-29） |
| v2 状态 | v2.0.0-alpha.2，预计 Q3 2026 稳定 |
| Stars | 12.7k |
| 运行时 | Node.js、Bun、Deno |

TypeScript SDK 是 monorepo 结构，拆成了几个独立的包：

- `@modelcontextprotocol/server` — 构建 MCP 服务器
- `@modelcontextprotocol/client` — 构建 MCP 客户端
- `@modelcontextprotocol/node` — Node.js Streamable HTTP 传输
- `@modelcontextprotocol/express` — Express 集成
- `@modelcontextprotocol/hono` — Hono 集成

v2 的一个亮点是引入 **Standard Schema** 支持，工具和 prompt 的 schema 可以用 Zod v4、Valibot、ArkType，不再绑定 Zod。

> 来源：[github.com/modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk)

### Java SDK

这个对咱们 Java 后端开发者最相关。

| 项目 | 信息 |
|------|------|
| 当前版本 | v2.0.0（2026-06-11，刚发没几天） |
| Stars | 3.5k |
| Java 版本 | Java 17+ |
| 许可证 | MIT |

v2.0.0 是 1.x 以来的首个大版本，跟 Spring AI 深度集成。模块拆分如下：

| 模块 | 用途 |
|------|------|
| `mcp-bom` | 依赖版本管理（BOM） |
| `mcp-core` | 核心实现，支持 STDIO、JDK HttpClient、Servlet |
| `mcp-json-jackson2` | Jackson 2 JSON 绑定 |
| `mcp-json-jackson3` | Jackson 3 JSON 绑定（默认） |
| `mcp` | 便捷 bundle（core + Jackson 3） |
| `mcp-test` | 测试工具 |
| `conformance-tests` | MCP 一致性测试套件 |

几个设计决策值得关注：

- **响应式编程模型**：基于 Project Reactor 的 Reactive Streams，同时提供同步门面。跟 Spring WebFlux 天然契合
- **JSON 序列化抽象**：通过 `io.modelcontextprotocol.json` 包抽象了 Jackson，不锁死具体实现
- **可观测性**：SLF4J 日志 + Reactor Context 传播，兼容 Micrometer 和 OpenTelemetry

**一致性测试结果**（v0.1.15）：

| 测试套件 | 结果 |
|---------|------|
| Server | ✅ 40/40 通过 |
| Client | 🟡 9/10 通过 |
| Auth（Spring） | 🟡 98.9% 通过 |

Server 端 100% 通过，说明协议实现的完整性没问题。Client 和 Auth 的小差距应该会在后续版本补齐。

**Spring AI 集成**方面，Spring AI 2.0+ 提供了：

- MCP Annotations — 注解驱动的服务端/客户端方法处理
- MCP Security — OAuth 2.0 和 API Key 安全支持
- Spring Boot Starter — 通过 [start.spring.io](https://start.spring.io) 直接引导

想快速上手的话，通过 Spring Initializr 创建项目，加 `spring-ai-starter-mcp-server` 依赖，用 `@McpTool` 注解定义工具方法就行。

> 来源：[github.com/modelcontextprotocol/java-sdk](https://github.com/modelcontextprotocol/java-sdk)

### Python SDK

| 项目 | 信息 |
|------|------|
| 当前稳定版 | v1.27.2（2026-05-29） |
| v2 预发布 | v2.0.0a1（2026-06-11），稳定版目标 2026-07-27 |
| Stars | 23.3k（三个 SDK 里最高） |

Python SDK 的高级接口叫 `FastMCP`，支持 Resources、Tools、Prompts、Elicitation（表单模式和 URL 模式），认证方面实现了 OAuth 2.1 Resource Server（RFC 9728）。

传输方面，**Streamable HTTP** 已经是生产部署的推荐选择了，SSE 基本可以退休了。

```python
# 安装
uv add "mcp[cli]"

# 开发调试
uv run mcp dev server.py

# 注册到 Claude Desktop
uv run mcp install server.py
```

> 来源：[github.com/modelcontextprotocol/python-sdk](https://github.com/modelcontextprotocol/python-sdk)

### 还有 7 个官方 SDK

除了上面三个，官方还维护了 **C#、Go、Kotlin、PHP、Ruby、Rust、Swift** 的 SDK。加起来一共 10 种语言，覆盖面相当广了。

> 来源：[modelcontextprotocol.io/introduction](https://modelcontextprotocol.io/introduction)

---

## MCP Registry：找 MCP 服务器不用再到处翻了

MCP Registry 是 MCP 服务器的官方注册中心，类似 npm 之于 Node.js 包。以前想找一个 MCP 服务器，得去 GitHub 上搜、去 awesome-mcp-servers 列表里翻，现在有了统一的地方。

| 项目 | 信息 |
|------|------|
| 地址 | [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io) |
| GitHub | [github.com/modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry) |
| 状态 | 预览阶段，API v0.1 已冻结 |
| 最新版本 | v1.7.9（2026-05-12） |
| 技术栈 | Go (92.6%) + PostgreSQL |

### 怎么发布自己的 MCP 服务器？

Registry 提供了 `mcp-publisher` CLI 工具，支持四种认证方式：

| 认证方式 | 说明 | 适合谁 |
|---------|------|--------|
| GitHub OAuth | 登录 GitHub 账号发布 | 个人开发者 |
| GitHub OIDC | 从 GitHub Actions 发布 | CI/CD 自动化 |
| DNS 验证 | 通过 DNS 记录证明域名所有权 | 组织/企业 |
| HTTP 验证 | 通过 HTTP 请求证明域名所有权 | 组织/企业 |

有个坑要注意：Registry 强制做**命名空间所有权验证**。比如你要发布 `io.github.zhangsan/...` 的服务器，必须以 `zhangsan` 这个 GitHub 账号登录，或者在他的 Actions 里跑。别想着冒名发布。

> 来源：[github.com/modelcontextprotocol/registry](https://github.com/modelcontextprotocol/registry)

---

## MCP Apps：在聊天窗口里跑交互式 UI

这个扩展有点意思。MCP Apps 允许服务器返回**交互式 HTML 界面**，直接在聊天窗口里渲染。以前 MCP 工具只能返回文本、图片、结构化数据，现在能返回一个完整的交互式应用。

### 怎么做到的？

当 LLM 调用一个支持 MCP Apps 的工具时：

1. 工具描述里带一个 `_meta.ui.resourceUri` 字段，指向一个 `ui://` 资源
2. Host 从服务器获取这个资源（HTML + JS + CSS）
3. 在聊天中用沙箱化的 `<iframe>` 渲染
4. App 和 Host 通过 postMessage 的 JSON-RPC 协议双向通信

App 可以调用 MCP 工具、发消息、更新上下文，但运行在沙箱里——没法访问父页面的 DOM、cookie、localStorage，也没法导航父页面。安全这块不用担心。

### 什么场景用得上？

- **数据可视化**：交互式地图、图表，点击钻取
- **复杂配置**：表单化的部署选项，带验证和默认值
- **富媒体预览**：PDF 查看器、3D 模型
- **实时监控**：仪表盘持续更新
- **多步骤工作流**：审批、代码审查

### 哪些客户端支持？

目前支持 MCP Apps 的客户端：**Claude**、**Claude Desktop**、**VS Code GitHub Copilot**、**Goose**、**Postman**、**MCPJam**、**Archestra.AI**。

框架方面，官方提供了 React、Vue、Svelte、Preact、Solid 和 vanilla JS 的示例模板。`@modelcontextprotocol/ext-apps` 包里的 `App` 类是可选的，你也可以直接实现 postMessage 协议，零依赖。

> 来源：[modelcontextprotocol.io/extensions/apps/overview](https://modelcontextprotocol.io/extensions/apps/overview)

---

## 治理：MCP 不再是 Anthropic 的"私有项目"

MCP 现在由 **Linux Foundation** 托管，法律实体是 "Model Context Protocol, a Series of LF Projects, LLC"。代码用 Apache License 2.0，文档用 Creative Commons BY 4.0。

### 谁在管？

| 角色 | 干什么 |
|------|--------|
| Lead Maintainers (BDFL) | 最终拍板，当前是 David Soria Parra 和 Den Delimarsky |
| Core Maintainers | 定方向，7 个人 |
| Maintainers | 管各个工作组、SDK、组件 |
| Contributors | 提 Issue、PR、参与讨论 |

有个原则挺好：**治理成员身份基于个人能力，跟所属公司没关系**。没有为任何公司保留的席位。

MCP 的联合发明人 Justin Spahr-Summers 已经转为荣誉退休（Emeritus）。

### SEP 流程

想给 MCP 规范提变更？走 SEP（Specification Enhancement Proposal）流程。目前一共 **42 个 SEP**，技术类的（JSON Schema、OAuth、HTTP 标准化）和治理类的（贡献者阶梯、工作组章程）都有。新功能进规范必须过 SEP，而且最终 SEP 必须通过一致性测试（SEP-2484）。

> 来源：[modelcontextprotocol.io/community/governance](https://modelcontextprotocol.io/community/governance)

---

## 写在最后

MCP 花了不到两年，从一个协议长成了一个完整的生态。几个趋势值得留意：

**协议在做减法，生态在做加法。** Draft 版本的方向很明确——无状态、移除握手、废弃低频功能，让协议本身更简单。同时生态在快速扩展：MCP Apps 给了交互式 UI 能力，MCP Registry 统一了服务器发现，42 个 SEP 在持续推进。

**治理跑在了技术前面。** 很多开源项目是先做技术再补治理，MCP 反过来了——Linux Foundation 托管、明确的角色定义、SEP 流程、功能生命周期管理，这些"非技术"的东西反而给 MCP 的长期生命力打了底。

**Java 开发者的窗口期。** Java SDK v2.0.0 刚发布，Spring AI 集成已经到位，一致性测试 Server 端 100% 通过。现在入场构建 MCP 服务器，时机不错。

2026-07-28 正式版发布、三大 SDK v2 稳定、MCP Apps 生态扩展——后面还有得看。

---

> **参考来源**：
> - [MCP 官方规范](https://modelcontextprotocol.io/specification)
> - [MCP 规范 GitHub 仓库](https://github.com/modelcontextprotocol/specification)
> - [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
> - [MCP Java SDK](https://github.com/modelcontextprotocol/java-sdk)
> - [MCP Python SDK](https://github.com/modelcontextprotocol/python-sdk)
> - [MCP Registry](https://github.com/modelcontextprotocol/registry)
> - [MCP Apps 文档](https://modelcontextprotocol.io/extensions/apps/overview)
> - [MCP 治理文档](https://modelcontextprotocol.io/community/governance)
> - [MCP SEPs](https://github.com/modelcontextprotocol/specification/tree/main/seps)
