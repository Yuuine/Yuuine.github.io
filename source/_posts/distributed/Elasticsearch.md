---
title: 分布式搜索引擎 Elasticsearch
date: 2025-07-09 15:24:48
categories: [ distributed ]
tags: [ Elasticsearch, Search, Vector Search, ES|QL, Distributed System, SpringBoot ]
permalink: /distributed/Elasticsearch/
---

# Elasticsearch

## 1. 什么是 Elasticsearch

[Elasticsearch](https://github.com/elastic/elasticsearch) 是基于 Apache Lucene 的分布式、RESTful 搜索和分析引擎，是 Elastic Stack 的核心组件。它支持实时数据摄取、存储、搜索和分析，广泛应用于全文搜索、日志分析、观测性和安全等领域。在 9.x 中，Elasticsearch 构建于 Lucene 10 之上，进一步提升了性能、向量搜索能力和 AI 集成。

> 分布式系统是指由多个相互连接的独立计算机（节点）组成的系统，这些节点通过网络协作共同完成任务，而不是依赖单一中心化服务器。分布式架构的核心目标是实现高可用性、可扩展性和容错能力。

> [Apache Lucene](https://lucene.apache.org/) 是一个开源的高性能全文搜索引擎库，用 Java 编写，提供强大的索引和搜索能力。它是许多搜索系统的底层引擎，包括 Elasticsearch。

### 主要特性

- **强大的搜索能力**：支持全文搜索、向量搜索（kNN）和混合搜索
- **向量数据库支持**：内置高效的近似最近邻（ANN）搜索，适用于 RAG 和语义搜索，BBQ 量化默认启用
- **ES|QL 查询语言**：管道式查询语言，支持 LOOKUP JOIN、跨集群查询等高级分析
- **数据流和时间序列优化**：内置 TSDB 和 LogsDB 模式，优化存储和查询
- **失败存储**：数据流支持摄取失败重定向，提升可靠性
- **高可用性和扩展性**：分布式架构，支持横向扩展和实时操作

### 核心组件

- **Index**：数据存储单元，类似于数据库中的表
- **Document**：JSON 格式的基本数据单元
- **Shard**：索引的分片，支持分布式存储
- **Cluster**：节点集群，提供高可用
- **Mapping**：字段类型定义
- **Query DSL**：结构化查询语言

## 2. Elasticsearch 的基础语法

Elasticsearch 使用 RESTful API 操作，主要通过 HTTP 请求（如 PUT、POST、GET、DELETE）与 `_api` 端点交互。

### 创建索引与映射

```bash
PUT /books
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "author": { "type": "keyword" },
      "publish_date": { "type": "date" },
      "embedding": {
        "type": "dense_vector",
        "dims": 768,
        "index": true,
        "similarity": "cosine",
        "quantization": "bbq"  # 9.x 默认量化
      }
    }
  }
}
```

### 索引文档

```bash
POST /books/_doc/1
{
  "title": "Elasticsearch Guide",
  "author": "Elastic",
  "publish_date": "2025-01-01",
  "embedding": [0.1, 0.2, ...]
}

# 批量索引
POST /books/_bulk
{ "index": { "_id": "2" } }
{ "title": "Advanced Search", "author": "John Doe" }
```

### 基本搜索

```bash
GET /books/_search
{
  "query": {
    "match": {
      "title": "Elasticsearch"
    }
  }
}

# 向量搜索（kNN）
GET /books/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.1, 0.2, ...],
    "k": 10,
    "num_candidates": 100
  }
}

# 混合搜索（结合文本和向量）
GET /books/_search
{
  "query": {
    "match": { "title": "Guide" }
  },
  "knn": { ... }
}
```

## 3. Elasticsearch的高级功能

### ES|QL 查询

ES|QL 支持管道式查询，支持 LOOKUP JOIN 和跨集群搜索（CCS）。

```bash
POST /_query
{
  "query": """
  FROM books
  | WHERE title LIKE "*Search*"
  | STATS COUNT(*) BY author
  """

  # LOOKUP JOIN
  FROM employees
  | LOOKUP JOIN departments ON dep_id
  | KEEP name, dep_name
  """
}
```

### 向量量化（BBQ）

9.x 中 BBQ 默认启用，显著降低内存占用并提升查询速度。

```bash
# 字段定义中启用量化
"embedding": {
  "type": "dense_vector",
  "dims": 1024,
  "index": true,
  "similarity": "cosine",
  "quantization": "bbq"
}
```

### 数据流（Data Streams）

适用于日志和时间序列，支持失败存储。

```bash
PUT _data_stream/my-logs
{
  "data_stream_options": {
    "failure_store": { "enabled": true }
  }
}
```

### 4. ES 9.x

#### 4.1 认证与安全（HTTP header 示例）

ES 集群通常部署在受保护环境，需要身份验证。常见方式包括 Basic、Bearer token、API Key 等：

- Basic（用户名：密码）

```bash
# Basic Auth
curl -u elastic:password -XGET "https://es.example.com:9200/_cluster/health"
```

- API Key（推荐用于服务间交互）

```bash
# 创建 API Key（一次性，由拥有权限的用户创建）
POST /_security/api_key
{
  "name": "my-service-key",
  "role_descriptors": { }
}

# 使用时在 Header 中传递
Authorization: ApiKey <base64(id:api_key)>
```

- Bearer（OAuth 或 token）

```bash
Authorization: Bearer <access_token>
```

#### 4.2 索引与映射（向量字段与量化）

9.x 中对向量搜索能力继续增强，并且 BBQ（block-based quantization）在很多场景下默认启用，显著降低内存并提升近似最近邻（ANN）检索性能。

```bash
PUT /books
{
  "mappings": {
    "properties": {
      "title": { "type": "text" },
      "content": { "type": "text" },
      "embedding": {
        "type": "dense_vector",
        "dims": 768,
        "index": true,
        "similarity": "cosine",
        "quantization": "bbq"     # 9.x 常见建议：启用量化以节约内存
      }
    }
  }
}
```

注意：向量字段索引通常会占用较多资源；在生产中需要根据查询吞吐和精度做权衡（dims、num_candidates、量化参数等）。

#### 4.3 向量（kNN）检索与混合检索示例

- 纯向量 kNN 查询：

```bash
GET /books/_search
{
  "knn": {
    "field": "embedding",
    "query_vector": [0.01, -0.02, ...],
    "k": 10,
    "num_candidates": 100
  }
}
```

- 混合检索（向量 + 文本评分）：常见作法是把向量检索得分和文本检索得分合并（script_score / rescore）来实现更好的排序。

```bash
GET /books/_search
{
  "query": {
    "bool": {
      "must": [
        { "match": { "title": "搜索 相关 词" } }
      ]
    }
  },
  "knn": {
    "field": "embedding",
    "query_vector": [0.01, -0.02, ...],
    "k": 50,
    "num_candidates": 200
  },
  "rescore": {
    "window_size": 50,
    "query": {
      "rescore_query": {
        "script_score": {
          "script": {
            "source": "_score + params.vs_score",
            "params": { "vs_score": 1.0 }
          }
        }
      }
    }
  }
}
```

（实际生产中常把向量得分归一化后用权重合并文本得分）

#### 4.4 高吞吐检索：Point-in-Time (PIT) + search_after

对于分页深度较大或强一致性读取的场景，推荐使用 PIT + search_after（替代 scroll 在多数交互场景下）。

```bash
# 1) 创建 PIT（Point in Time）
POST /books/_pit?keep_alive=1m
# 返回 pit_id

# 2) 使用 search with pit + search_after
GET /books/_search
{
  "pit": { "id": "<pit_id>" , "keep_alive": "1m" },
  "size": 100,
  "query": { "match_all": {} },
  "search_after": ["<last_sort_value>"]
}

# 3) 完成后关闭 PIT
DELETE /_pit
{
  "id": ["<pit_id>"]
}
```

PIT 保证分页查询在一个一致的快照上进行，避免 deep pagination 导致不稳定性。

#### 4.5 异步搜索（Async Search）

当查询开销大或需要在后台执行并稍后取回结果时使用异步搜索。

```bash
# 提交异步搜索（不等待完成）
POST /_async_search?wait_for_completion=false
{
  "query": { "match_all": {} },
  "size": 1000
}

# 查询异步任务结果
GET /_async_search/<id>

# 取消任务
DELETE /_async_search/<id>
```

#### 4.6 Bulk / Ingest / Pipeline（批量写入与预处理）

- 使用 bulk API 进行高效批量写入：

```bash
POST /_bulk
{ "index": { "_index": "books", "_id": "1" } }
{ "title": "A", "content": "...", "embedding": [ ... ] }
{ "index": { "_index": "books", "_id": "2" } }
{ "title": "B", "content": "...", "embedding": [ ... ] }
```

- 在写入时组合 Ingest Pipeline（如文本处理、tokenization、去噪、提取 metadata）：

```bash
PUT /_ingest/pipeline/my_pipeline
{
  "processors": [
    { "set": { "field": "ingested_at", "value": "{{_ingest.timestamp}}" } }
  ]
}

POST /books/_doc?pipeline=my_pipeline
{ "title": "..." }
```

#### 4.7 数据迁移：reindex 与 update_by_query

- reindex：把数据从一个索引复制到另一个索引（可在目的索引上调整映射）

```bash
POST _reindex
{
  "source": { "index": "old_index" },
  "dest": { "index": "new_index" }
}
```

- update_by_query：批量修改满足条件的文档

```bash
POST /books/_update_by_query
{
  "script": {
    "source": "ctx._source.views = params.views",
    "lang": "painless",
    "params": { "views": 0 }
  },
  "query": { "term": { "status": "draft" } }
}
```

#### 4.8 ES|QL（管道式 SQL-like 查询）

ES|QL 提供类似 SQL 的语法并支持管道计算，适合做分析类查询。

```bash
POST /_query
{
  "query": """
  FROM books
  | WHERE title LIKE '*搜索*'
  | STATS COUNT(*) BY author
  """
}
```

---
