---
title: 什么是 MCP ?
categories: [ AI, MCP ]
date: 2026-03-25 22:48:59
tags: [ MCP, AI, LLM ]
permalink: /ai/mcp/introduceMCP/
math: true
---

# MCP 概述

## 一、引言

**Model Context Protocol (MCP)**，即模型上下文协议，是 Anthropic 于 2024 年提出的开放协议，被誉为 **"AI 领域的 USB-C 接口"**。它通过 JSON-RPC 2.0 统一了 LLM 与外部数据源、工具的通信规范，解决了 AI 应用开发中的**复杂性和碎片化**问题。

在 MCP 出现之前，每当需要让 LLM 访问新的数据源或调用新的工具时，开发者都需要为不同模型（Claude、GPT、DeepSeek）编写各自的适配代码。这导致了重复工作、高昂的维护成本和生态碎片化。

MCP 的核心价值在于**解耦和标准化**——一次开发的 MCP Server，之后所有支持 MCP 的 AI 应用都能直接复用，真正实现模型与外部世界的高效解耦。

---

## 二、为什么需要 MCP？

### 1. 解决碎片化集成问题

| 问题 | 说明 | MCP 的解决方案 |
|------|------|----------------|
| **重复工作** | 同一功能需要为每个 LLM 重新实现 | 统一协议，一次开发多处复用 |
| **高昂维护成本** | API 变更需要多处同步修改 | 协议层统一抽象 |
| **生态碎片化** | 缺乏统一的工具接口标准 | 标准化接口规范 |
| **精确计算** | LLM 不擅长数值计算 | 通过 Tools 调用计算器 |
| **实时信息** | 训练数据有截止日期 | 通过 Resources 获取最新数据 |
| **系统交互** | 无法直接操作本地文件/数据库 | 通过 Tools 桥接系统 API |

### 2. MCP 与传统集成方式对比

```
传统方式：
每个 LLM → 各自的 Function Calling 格式 → 定制化适配代码 → 外部系统

使用 MCP 后：
多个 LLM → 统一的 MCP 协议 → 一次开发的 MCP Server → 外部系统
```

---

## 三、MCP 的四大核心能力

MCP 规范定义了四种核心能力类型：

| **能力** | **核心作用** | **实际场景举例** | **注意事项** |
|----------|-------------|-----------------|-------------|
| **Resources** | **只读数据流**。让模型能像读取本地文件一样读取外部数据 | 自动读取 GitHub Repo 里的文档、数据库中的历史记录 | 大文件需实现 Chunking 分块加载（建议单块 < 100KB） |
| **Tools** | **可执行动作**。模型可以主动触发的代码或 API | 运行 Python 脚本、在 Slack 发送消息、执行 SQL | **必须幂等设计**：防重试风暴；超时需配置退避策略 |
| **Prompts** | **预设指令集**。服务器提供给模型的"标准化操作指南" | "重构这段代码"、"生成周报"等特定业务场景的 Prompt 模板 | 模板渲染失败需返回清晰错误信息 |
| **Sampling** | **让 MCP Server 能够请求 Host 端的 LLM 进行推理生成** | 日志分析：Server 读取日志后请求 Host 的 LLM 总结错误模式 | 超时需退避重试；用户拒绝时需优雅降级 |

> **Sampling 机制说明**：这打破了传统 MCP Server 的单向数据流，允许 Server 在获取数据后，利用 Host 强大的 LLM 能力进行总结、理解或生成，再将结果返回给用户。

{% mermaid %}
flowchart TB
    subgraph MCP["MCP 四大核心能力"]
        direction TB
        A["Sampling\n请求 LLM 推理"] --> B["Transport Layer\n传输层"]
        C["Tools\n可执行动作"] --> B
        D["Resources\n只读数据"] --> B
        E["Prompts\n预设指令"] --> B
    end

    B <--> |"JSON-RPC 2.0"| F["MCP Host / Client"]

    style A fill:#E99151,color:#fff
    style B fill:#9B59B6,color:#fff
    style C fill:#00838F,color:#fff
    style D fill:#00838F,color:#fff
    style E fill:#00838F,color:#fff
{% endmermaid %}

---

## 四、MCP、Function Calling 和 Agent 的区别

这是 MCP 学习过程中的高频问题，需要从**定位、层次、关系**三个维度理解：

| 对比维度 | **MCP** | **Function Calling** | **Agent** |
|----------|-------------|---------------------|-----------|
| **定位** | **协议标准** | **调用机制** | **系统概念** |
| **本质** | 应用层网络协议（JSON-RPC 2.0） | LLM 推理层能力（NL→JSON 映射） | 任务执行系统 |
| **状态模型** | 有状态（持久连接，支持能力发现+执行） | 隐状态（多轮对话中保持上下文） | 可松可紧 |
| **提出方** | Anthropic (2024) | 各模型厂商（OpenAI、Anthropic 等） | 学术界/工业界 |
| **耦合度** | 松耦合（跨平台） | 紧耦合（依赖特定模型） | 可松可紧 |
| **实现方式** | 统一的 JSON-RPC | 各厂商私有格式 | 多种技术组合 |
| **应用场景** | 工具集成标准化 | 单次/多次函数调用 | 复杂任务自动化 |

**典型场景举例**：

| 场景 | 使用方案 | 说明 |
|------|---------|------|
| 让 Claude 读取本地文件 | **MCP** | 需要标准化接口，可跨平台复用 |
| 调用 OpenAI 的 weather_tool | **Function Calling** | 模型原生能力，简单直接 |
| 自动化分析代码并修复 Bug | **Agent** | 需要多步规划和决策 |
| 构建团队共享的知识库工具 | **MCP** | 一次开发，多处使用 |

> **常见误区**：认为"MCP 会取代 Function Calling"是错误的。Function Calling 属于 LLM 的推理层能力（将自然语言映射为结构化 JSON）；MCP 是应用层的网络通信协议（基于 JSON-RPC 2.0），提供标准化的跨平台能力发现和执行。两者是**不同层次、不同维度的协作关系**。

---

## 五、MCP 架构详解

### 1. 四层架构概览

MCP 采用**分层架构设计**，包含四个核心组件：

{% mermaid %}
flowchart TB
    classDef client fill:#00838F,color:#FFFFFF,stroke:none,rx:10,ry:10
    classDef infra fill:#9B59B6,color:#FFFFFF,stroke:none,rx:10,ry:10
    classDef business fill:#E99151,color:#FFFFFF,stroke:none,rx:10,ry:10
    classDef storage fill:#E4C189,color:#333333,stroke:none,rx:10,ry:10

    subgraph Host["MCP Host (AI 应用层)"]
        direction TB
        style Host fill:#F5F7FA,color:#333333,stroke:#005D7B,stroke-width:2px
        App["Claude Desktop\nVS Code / Cursor"]:::client
    end

    subgraph Layer["MCP 协议层"]
        direction LR
        style Layer fill:#F5F7FA,color:#333333,stroke:#005D7B,stroke-width:2px
        MCPClient["MCP Client\n(连接管理)"]:::infra --> MCPServer["MCP Server\n(功能接口)"]:::business
    end

    subgraph Data["数据/服务层"]
        direction LR
        style Data fill:#F5F7FA,color:#333333,stroke:#005D7B,stroke-width:2px
        LocalFiles["本地文件\nGit 仓库"]:::storage
        ExternalAPI["外部 API\nGitHub / 天气"]:::storage
    end

    App --> MCPClient
    MCPServer --> LocalFiles
    MCPServer --> ExternalAPI

    linkStyle default stroke-width:2px,stroke:#333333,opacity:0.8
{% endmermaid %}

### 2. 核心组件详解

| 组件 | 定位 | 职责 | 代表产品 |
|------|------|------|---------|
| **MCP Host** | 用户交互层 | 运行 AI 应用，托管 LLM，管理 MCP Client | Claude Desktop、VS Code (Cline)、Cursor |
| **MCP Client** | 连接管理层 | 与 MCP Server 建立 1:1 连接，转发 JSON-RPC 请求 | 集成在 Host 内部 |
| **MCP Server** | 能力暴露层 | 实现 MCP 协议，暴露 Resources/Tools 等能力 | 开发者使用 SDK 开发 |
| **Data Source** | 数据/服务层 | 提供实际数据或执行操作 | 文件系统、数据库、外部 API |

**重要特性**：

1. **一对多关系**：一个 Host 可以管理多个 Client，每个 Client 对应一个 Server
2. **解耦设计**：Client 和 Server 通过 JSON-RPC 通信，不依赖具体实现
3. **多实例支持**：可以同时连接多个不同功能的 MCP Server

### 3. 完整工作流程

{% mermaid %}
sequenceDiagram
    participant U as User
    participant H as Host (LLM)
    participant C as MCP Client
    participant S as MCP Server
    participant D as Data Source

    U->>H: 提问: "分析这个仓库的最新提交"
    H->>H: 思考 (Chain of Thought)
    H->>C: Call Tool: list_commits()
    C->>S: JSON-RPC Request<br/>{method: "tools/call", params: ...}
    S->>D: Fetch Git Logs
    D-->>S: Return Logs
    S-->>C: JSON-RPC Response<br/>{result: ...}
    C-->>H: Tool Output
    H->>H: 思考与总结
    H-->>U: 返回分析结果
{% endmermaid %}

| 步骤 | 描述 | 关键点 |
|------|------|--------|
| **1. 用户请求** | 用户通过 Host 发送问题 | Host 首先接收用户输入 |
| **2. LLM 推理** | Host 内部的 LLM 判断是否需要外部能力 | 使用 Chain of Thought 进行思考 |
| **3. 工具调用** | LLM 决定调用哪个 Tool | 通过 Client 发起调用 |
| **4. 协议转换** | Client 将调用转换为 JSON-RPC 请求 | 标准化的消息格式 |
| **5. Server 处理** | MCP Server 解析请求并访问数据源 | 业务逻辑的真正执行者 |
| **6. 数据返回** | 结果沿原路返回给 LLM | JSON-RPC Response |
| **7. 最终生成** | LLM 结合工具结果生成最终回复 | 用户体验的核心环节 |

---

## 六、通信协议：JSON-RPC 2.0

### 1. 为什么选择 JSON-RPC 2.0？

| 优势 | 说明 |
|------|------|
| **轻量级** | 无需 Protobuf 编译，降低接入阻力；需依赖 JSON Schema 对 Tool 入参进行校验 |
| **传输无关** | 可以运行在 stdio、HTTP、WebSocket 等多种传输层之上 |
| **易调试** | 纯文本格式，便于人工阅读和调试 |
| **广泛支持** | 几乎所有编程语言都有成熟的 JSON-RPC 库 |

### 2. JSON-RPC 消息格式

```json
// 请求
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "read_file",
    "arguments": { "path": "/path/to/file.txt" }
  },
  "id": 1
}

// 响应
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "文件内容..."
      }
    ]
  }
}
```

### 3. JSON-RPC vs RESTful

| 对比维度 | HTTP (RESTful) | JSON-RPC |
|---------|----------------|----------|
| **语义模型** | 面向资源 (Resource-Oriented) | 面向操作 (Action-Oriented) |
| **调用方式** | GET/POST/PUT/DELETE + URI | method 名 + 参数 |
| **数据格式** | 灵活 (JSON/XML/HTML) | 严格 JSON |
| **功能特性** | 丰富 (状态码/缓存/重定向) | 极简 (仅 RPC 规范) |
| **适用场景** | 公开 API、Web 服务 | 内部通信、工具调用 |

---

## 七、传输层详解

### 1. stdio（标准输入/输出）

| 特性 | 说明 |
|------|------|
| **适用场景** | 本地进程间通信 (IPC) |
| **实现方式** | Host 启动 MCP Server 作为子进程，通过 stdin/stdout 通信 |
| **优势** | 极度轻量，无网络开销，启动快 |
| **典型应用** | Claude Desktop、本地 IDE 插件 |

**安全提示**：stdio 模式下 MCP Server 与 Host 同权限，恶意 Server 可读取任意文件。生产环境必须采用以下防护措施：

- **系统级隔离**：引入基于 cgroups 与 namespace 的沙箱（如 Docker/gVisor），建议限制 CPU < 10% 配额、内存 < 512MB
- **进程管理**：配置子进程的 SIGTERM/SIGKILL 优雅退出钩子，防止僵尸进程
- **源码审计**：审阅社区 Server 的源代码，只使用可信来源

### 2. Streamable HTTP（推荐）

MCP 协议版本 `2025-03-26` 正式引入 Streamable HTTP 传输方式，取代了旧版的 HTTP+SSE。

| 特性 | 说明 |
|------|------|
| **适用场景** | 远程部署、独立服务、生产环境 |
| **实现方式** | 单端点（如 `/mcp`），客户端 POST 发送 JSON-RPC 请求，服务端按需返回 JSON 响应或 SSE 流 |
| **优势** | 标准兼容性好（负载均衡器、API 网关、CORS 中间件开箱即用），每条请求独立鉴权 |
| **典型应用** | Web 应用、团队共享的 MCP 服务、云端托管 MCP Server |

**Streamable HTTP 核心机制**：

| 能力 | 说明 |
|------|------|
| **单端点交互** | 所有客户端→服务端消息通过 POST 发送到同一端点 |
| **灵活响应** | 服务端返回 `application/json`（简单请求-响应）或 `text/event-stream`（流式推送） |
| **会话管理** | 通过 `Mcp-Session-Id` 响应头分配会话 ID，客户端在后续请求中携带 |
| **可恢复性** | 基于 SSE 事件 ID + `Last-Event-ID` 请求头实现断线重连后消息补发 |

**Streamable HTTP vs 旧版 HTTP+SSE**：

| 对比维度 | 旧版 HTTP+SSE（已废弃） | Streamable HTTP（当前推荐） |
|---------|----------------------|---------------------------|
| **端点数量** | 两个（`/sse` + `/sse/messages`） | 一个（如 `/mcp`） |
| **连接模型** | 必须维护持久 SSE 连接 | 标准 HTTP 请求-响应，SSE 可选 |
| **认证** | 仅连接建立时校验 | 每条 POST 请求携带 `Authorization` 头，逐条鉴权 |
| **基础设施** | 需要粘性会话 | 与标准 HTTP 基础设施天然兼容 |

### 3. 传输方式选择

| 场景 | 推荐传输方式 |
|------|-------------|
| 本地开发、调试 | stdio |
| Claude Desktop / 本地 IDE 插件 | stdio |
| 生产环境 Web 应用 | Streamable HTTP |
| 团队共享的 MCP 服务 | Streamable HTTP |
| 需要 OAuth 2.0 / API Key 鉴权 | Streamable HTTP |

---

## 八、工程实践

### 1. 工具粒度设计

**原则：单一职责，语义明确**

| 反面示例 | 正面示例 |
|---------|---------|
| `execute_sql(sql)` | `get_user_by_id(id)` / `list_active_orders()` |
| `file_operation(op, path, data)` | `read_file(path)` / `write_file(path, content)` |
| `database(action, params)` | `query_userByEmail(email)` / `updateUserProfile(id, data)` |

**设计建议**：

- 工具名称使用**动词+名词**形式：`get_`、`list_`、`create_`、`update_`、`delete_`
- 参数类型要**明确且可验证**：使用 JSON Schema 定义
- 避免过度抽象：不要把多个操作塞进一个工具

### 2. Context Window 管理

| 问题 | 后果 | 解决方案 |
|------|------|---------|
| 上下文溢出 | LLM 无法处理完整内容 | 实现**分块 (Chunking)** 逻辑 |
| 中间丢失 | LLM 忽略上下文中间的内容 | 提供**摘要 (Summarization)** |
| Token 消耗过大 | 成本过高 | 实现**按需加载**和**增量同步** |
| **OOM 风险** | 内存溢出导致 Server 被 Kill | 严格限制单条资源大小（如 < 10MB） |

> **注意**：由于 MCP Server 是模型无感知的，严禁硬编码特定模型的 Tokenizer（如 `tiktoken`）进行预计算。

### 3. 错误处理

| 错误类型 | 处理方式 |
|---------|---------|
| **参数验证失败** | 返回清晰的错误提示和建议 |
| **权限不足** | 说明所需权限和申请方式（错误码 `-32003`） |
| **资源不存在** | 返回错误码 `-32004` |
| **服务暂时不可用** | 提供重试机制和预计恢复时间 |
| **部分失败** | 明确哪些操作成功、哪些失败 |

### 4. 安全防护

| 风险 | 防护措施 |
|------|---------|
| **路径遍历攻击** | 验证文件路径，限制访问目录 |
| **SQL 注入** | 使用参数化查询，禁止拼接 SQL |
| **敏感信息泄露** | 脱敏处理，避免返回完整凭证 |
| **资源滥用** | 实现速率限制和配额管理 |

### 5. 调试工具

- **MCP Inspector**：官方调试工具，可模拟 Host 发送请求

  ```bash
  npx @modelcontextprotocol/inspector node my-server.js
  ```

---

## 九、快速入门

### 1. 安装 MCP SDK

```bash
# Python
pip install mcp

# Node.js
npm install @modelcontextprotocol/sdk
```

### 2. 创建 MCP Server (Python)

```python
from mcp.server import Server
from mcp.types import Tool, TextContent

# 创建 Server 实例
server = Server("my-mcp-server")

# 定义 Tool
@server.tool()
async def get_weather(city: str) -> str:
    """获取指定城市的天气信息"""
    return f"{city} 今天晴天，温度 25°C"

# 定义 Resource
@server.resource("weather://forecast")
async def weather_forecast() -> str:
    """返回未来一周天气预报"""
    return "未来七天天气预报..."

# 启动 Server
if __name__ == "__main__":
    server.run()
```

### 3. 配置示例 (Claude Desktop)

```json
{
  "mcpServers": {
    "my-server": {
      "command": "python",
      "args": ["/path/to/my_server.py"],
      "env": {
        "API_KEY": "your-api-key"
      }
    }
  }
}
```

> **工程提示**：在生产环境中，请使用虚拟环境中的 Python 解释器路径，或推荐使用 `uvx`：
>
> ```json
> {
>   "command": "uvx",
>   "args": ["--from", "mcp", "python", "/path/to/my_server.py"]
> }
> ```

---

## 十、应用场景

| 场景 | 描述 | MCP 优势 |
|------|------|---------|
| **数据库问答** | LLM 连接企业数据库进行查询 | 标准化 SQL 工具调用 |
| **文档处理** | 检索和分析大量文档 | 统一资源访问接口 |
| **API 集成** | 调用外部 API 获取实时数据 | 声明式工具定义 |
| **代码助手** | 访问代码库、文件系统 | 安全沙箱化的资源访问 |
| **多模型编排** | 协调多个 LLM 的协作 | 中心化的上下文管理 |

---

## 十一、总结

MCP 协议把 AI 应用开发中碎片化的工具接入问题，拉到了一个统一的协议层上。

**核心要点回顾**：

1. **MCP 是什么**：AI 领域的"USB-C 接口"，通过 JSON-RPC 2.0 统一了 LLM 与外部工具的通信规范
2. **四大核心能力**：Resources（只读数据）、Tools（可执行动作）、Prompts（预设指令）、Sampling（请求 LLM 推理）
3. **四层架构**：Host → Client → Server → Data Source，一对多连接，模型无感知
4. **传输方式**：stdio（本地）、Streamable HTTP（远程），各有适用场景
5. **与其他概念的区别**：MCP 是协议标准，Function Calling 是 LLM 能力，Agent 是应用层系统

**学习建议**：

1. **动手实践**：写一个简单的 MCP Server，理解 Host-Client-Server 的交互流程
2. **阅读官方文档**：MCP 规范还在快速演进，保持对官方文档的关注
3. **关注生态**：Awesome MCP Servers 收集了大量开源实现，是学习的好素材

---

## 参考资料

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP GitHub 仓库](https://github.com/modelcontextprotocol)
- [MCP 中文站](https://mcpcn.com/)
