---
title: 什么是 MCP ?
categories: [ AI, MCP ]
date: 2026-03-25 10:00:00
tags: [ MCP, AI, LLM ]
permalink: /ai/mcp/introduceMCP/
math: true
---

# MCP 概述

## 一、引言

**Model Context Protocol (MCP)**，即模型上下文协议，是一种标准化协议，旨在通过提供结构化的上下文管理来增强大型语言模型（LLMs）与应用程序之间的交互。

在 AI 应用开发中，模型与外部数据源、工具的集成一直是痛点问题。传统方式下，每当需要让 LLM 访问新的数据源或调用新的工具时，开发者都需要编写大量定制化的集成代码。MCP 的出现彻底改变了这一现状——它提供了一套**统一的接口和协议**，使得 LLM 可以无缝连接任何符合协议的数据源和工具。

---

## 二、为什么需要 MCP？

### 1. 解决碎片化集成问题

在 MCP 出现之前，AI 应用开发者面临严重的**集成碎片化**问题：

- 每个数据源（数据库、文件系统、API）都需要独立的适配器
- 工具调用缺乏统一标准，Prompt 工程复杂且难以维护
- 上下文管理混乱，Token 消耗难以优化

MCP 通过**标准化协议**解决了这一根本问题。

### 2. 核心优势

| 优势 | 说明 |
|------|------|
| **标准化** | 统一的接口和协议，简化开发流程 |
| **高效性** | 优化的上下文管理，增强模型交互 |
| **可扩展性** | 灵活的架构支持自定义扩展 |
| **易用性** | 简单直观的 API，较低的使用门槛 |

### 3. 与传统集成方式对比

| 维度 | 传统集成方式 | MCP |
|------|-------------|-----|
| **接入新数据源** | 需要编写定制化代码 | 只需实现标准接口 |
| **工具调用** | Prompt 工程复杂 | 声明式工具定义 |
| **上下文管理** | 手动管理，容易超出 Token 限制 | 协议自动优化 |
| **可维护性** | 代码分散，难以维护 | 中心化配置，易于管理 |

---

## 三、MCP 的核心概念

### 1. 核心功能模块

{% mermaid %}
flowchart TB
    subgraph MCP["MCP"]
        direction TB
        A["采样机制\nSampling"] --> B["传输层\nTransport"]
        C["工具集\nTools"] --> B
        D["资源管理\nResources"] --> B
        E["提示词模板\nPrompts"] --> B
    end
    
    F["LLM"] <--> B
    G["外部应用"] <--> C
    H["外部应用"] <--> D
    I["外部应用"] <--> E
    
    style MCP fill:#1e3a5f,color:#fff
    style A fill:#2d5a87,color:#fff
    style B fill:#2d5a87,color:#fff
    style C fill:#2d5a87,color:#fff
    style D fill:#2d5a87,color:#fff
    style E fill:#2d5a87,color:#fff
{% endmermaid %}

### 2. 采样机制（Sampling）

MCP 的采样机制提供了**智能的上下文管理策略**：

- **上下文窗口优化**：自动决定哪些内容应该保留在上下文中
- **重要性评分**：对信息进行重要性排序，优先保留关键内容
- **动态压缩**：在 Token 限制内最大化有效信息密度

### 3. 传输层（Transport）

传输层负责 MCP 的**数据传输和通信协议**：

- 支持多种传输协议（HTTP、WebSocket 等）
- 提供可靠的请求/响应机制
- 支持双向流式通信
- 内置错误处理和重试机制

### 4. 工具集（Tools）

工具是 MCP 中**让 LLM 执行操作的核心机制**：

```json
{
  "name": "database_query",
  "description": "执行 SQL 查询",
  "inputSchema": {
    "type": "object",
    "properties": {
      "sql": {
        "type": "string",
        "description": "SQL 查询语句"
      }
    },
    "required": ["sql"]
  }
}
```

**工具调用流程**：

{% mermaid %}
sequenceDiagram
    participant LLM as 大语言模型
    participant MCP as MCP Host
    participant Tool as 外部工具
    
    LLM->>MCP: 请求调用工具
    MCP->>Tool: 转发调用请求
    Tool->>MCP: 返回执行结果
    MCP->>LLM: 格式化结果
    LLM->>LLM: 整合响应
{% endmermaid %}

### 5. 资源管理（Resources）

MCP 的资源机制允许 LLM **访问和操作外部数据**：

- 结构化资源：数据库记录、API 响应
- 非结构化资源：文档、代码文件
- 二进制资源：图片、音频等

### 6. 提示词工程（Prompts）

MCP 提供了**提示词模板的最佳实践**：

- 可复用的提示词模板
- 参数化的提示词构造
- 版本控制和模板管理

---

## 四、MCP 架构详解

### 1. 整体架构

{% mermaid %}
flowchart LR
    subgraph Client["MCP Client"]
        C1["请求构造"]
        C2["序列化"]
        C3["协议编码"]
    end
    
    subgraph Server["MCP Server"]
        S1["协议解码"]
        S2["路由分发"]
        S3["业务处理"]
    end
    
    subgraph App["应用程序"]
        A1["LLM"]
        A2["数据源"]
        A3["工具"]
    end
    
    Client --> |"传输层"| Server
    Server --> |"数据交互"| App
    App --> |"反馈"| Client
    
    style Client fill:#1a4d1a,color:#fff
    style Server fill:#1a4d1a,color:#fff
    style App fill:#2d5a87,color:#fff
{% endmermaid %}

### 2. 客户端组件

| 组件 | 职责 |
|------|------|
| **请求构造器** | 构建符合 MCP 协议的请求 |
| **序列化器** | 将数据结构转换为协议格式 |
| **协议编码器** | 处理通信编码和加密 |

### 3. 服务器组件

| 组件 | 职责 |
|------|------|
| **协议解码器** | 解析传入的 MCP 请求 |
| **路由分发器** | 将请求路由到对应的处理器 |
| **业务处理器** | 执行具体的业务逻辑 |

---

## 五、快速入门

### 1. 安装 MCP SDK

```bash
# Node.js
npm install @modelcontextprotocol/sdk

# Python
pip install mcp
```

### 2. 创建 MCP Server

```javascript
import { MCPServer } from '@modelcontextprotocol/sdk';

const server = new MCPServer({
  name: 'my-mcp-server',
  version: '1.0.0',
});

server.addTool({
  name: 'get_weather',
  description: '获取指定城市的天气信息',
  inputSchema: {
    type: 'object',
    properties: {
      city: {
        type: 'string',
        description: '城市名称',
      },
    },
    required: ['city'],
  },
  handler: async ({ city }) => {
    const weather = await fetchWeather(city);
    return { content: [{ type: 'text', text: weather }] };
  },
});

server.start();
```

### 3. 在 LLM 应用中使用

```javascript
import { MCPClient } from '@modelcontextprotocol/sdk';

const client = new MCPClient({
  serverUrl: 'http://localhost:3000',
});

const response = await client.complete({
  prompt: '北京今天天气怎么样？',
  tools: ['get_weather'],
});
```

---

## 六、应用场景

| 场景 | 描述 | MCP 优势 |
|------|------|----------|
| **数据库问答** | LLM 连接企业数据库进行查询 | 标准化 SQL 工具调用 |
| **文档处理** | 检索和分析大量文档 | 统一资源访问接口 |
| **API 集成** | 调用外部 API 获取实时数据 | 声明式工具定义 |
| **代码助手** | 访问代码库、文件系统 | 安全沙箱化的资源访问 |
| **多模型编排** | 协调多个 LLM 的协作 | 中心化的上下文管理 |

---

## 七、总结

MCP 作为模型上下文协议，为 AI 应用开发提供了**标准化、高效、可扩展**的解决方案。它不仅简化了 LLM 与外部世界的集成，更为 AI 应用的构建提供了最佳实践。

---

## 参考资料

- [MCP 官方文档](https://modelcontextprotocol.io/)
- [MCP 中文站](https://mcpcn.com/)
- [MCP GitHub 仓库](https://github.com/modelcontextprotocol)
