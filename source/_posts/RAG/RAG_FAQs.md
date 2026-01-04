---
title: RAG 常见问题
categories: [ RAG ]
date: 2025-11-15 20:32:39
tags: [ RAG ]
permalink: /rag/RAG_FAQs/
math: true
---

# RAG 常见问题

## 一、RAG 的工作流程

RAG 的整体流程可以分为 **离线构建** 和 **在线推理**两个阶段。

### 1. 离线阶段（知识库构建）

1. **文档采集与清洗**

    * 收集结构化或非结构化文档（PDF、Markdown、数据库等）
    * 去噪、去重、统一格式

2. **文档切分（Chunking）**

    * 按语义或长度将文档切分为若干片段
    * 可引入标题、章节信息作为上下文

3. **向量化（Embedding）**

    * 使用 Embedding 模型将每个 chunk 转换为向量表示

4. **向量存储**

    * 将向量、原文内容及元数据存入向量数据库

### 2. 在线阶段（问答流程）

1. **用户问题预处理**

    * 问题改写、扩展、消歧

2. **问题向量化**

    * 将用户问题转换为向量

3. **相似度检索（Recall）**

    * 在向量库中进行 TopK 相似度搜索或者 KNN + BM25 混合检索
    * 可结合关键词或结构化条件进行多路召回

4. **上下文构建**

    * 将召回文档整理为上下文 Prompt

5. **大模型生成（Generation）**

    * 将 Prompt 输入大模型
    * 生成最终回答

## 二、混合检索

**混合检索（Hybrid Search）**是指**同时使用多种检索策略**（通常是向量检索 + 关键词检索），并对结果进行融合排序，从而兼顾**语义召回能力**和**精确匹配能力**。

### 1. 为什么需要混合检索？

* 向量检索对数字、专有名词不敏感，而且检索的文档容易“语义相似但不相关”

### 2. 混合检索的整体流程

```text
用户问题
   ↓
Query 预处理
   ↓
并行召回
   ├─ 向量检索（Embedding + 向量库）
   └─ 关键词检索（BM25）
   ↓
候选结果合并
   ↓
融合排序（Score Fusion）
   ↓
TopK 文档
```

---

## 三、混合检索是怎么实现的？

### 1. 向量检索实现

* 使用 Embedding 模型将 query 向量化
* 在向量库中做 ANN 检索
* 返回 TopK + 相似度分数

### 2. 关键词检索实现

* 基于倒排索引
* 使用 BM25
* 精确匹配关键词、数字、ID

### 3. 结果融合

#### 1. 为什么不能直接拼结果？

* 各检索通道的 score 不同尺度
* 不同检索通道的结果不能排序比较

#### 2. 常见融合方式

#####  方式一：Score 归一化 + 加权

```text
final_score = α * vector_score + β * bm25_score
```

* α、β 根据实际情况调整

##### 方式二：Rank Fusion（RRF）

* 基于排名而非分数
* 对 score 不敏感

##### 方式三： Rerank 模型

* 混合召回 → Rerank 精排

> 混合检索通过并行使用向量检索和关键词检索，在保证语义召回的同时补充精确匹配能力，并通过融合排序或 Rerank 得到最终结果。

---

### RRF

* **RRF（Reciprocal Rank Fusion）** 是一种**结果融合算法**，用于将多路检索（向量检索、关键词检索等）得到的候选文档**按排名融合**，得到最终排序结果。
* 核心思想：**越靠前的文档贡献越高，但不强依赖分数绝对值**。

选用 RRF 主要原因如下：
1. TopK 排名相对稳定，不易被异常分数干扰
2. 实现简单，效果稳定

> RRF 常用于**粗召回融合**，再送给 Rerank 做精排。

实现思路参考

* 多路检索结果：List<List<SearchResult>>

    * 每路结果按得分排序
    * 每个 `SearchResult` 包含 `docId` 和原始 score

核心算法
```java
double k = 60.0; // 平滑常数
Map<String, Double> fusedScores = new HashMap<>();

for (List<SearchResult> results : allChannels) {
    for (int rank = 0; rank < results.size(); rank++) {
        SearchResult r = results.get(rank);
        fusedScores.merge(r.getDocId(), 1.0 / (k + rank + 1), Double::sum);
    }
}

// 按分数排序，取 TopN
List<SearchResult> finalResults = fusedScores.entrySet().stream()
        .sorted(Map.Entry.<String, Double>comparingByValue().reversed())
        .limit(topN)
        .map(entry -> fetchDocument(entry.getKey()))
        .collect(Collectors.toList());
```

---

## 四、如何优化 RAG 提高召回率

提高召回率的本质是让用户问题和知识库中相关文档尽可能被召回。

优化点主要集中在 **查询改写、向量质量、文档切分、召回策略、TopK 调整、多路召回** 五个方面。

---

### 1. 查询改写（Query Rewrite / Expansion）

* 用户问题通常过短、口语化或含指代（“它”、“这个”）
* 通过 LLM 或规则扩展查询：

    * 原始问题 → 多条改写查询
    * 增加同义词、上下文信息
* **效果**：增加候选文档覆盖率

### 2. 向量质量优化

* 使用和文档相同语言 / 领域的 embedding 模型
* 对专有名词、业务术语做同义词映射
* 确保 query 向量和文档向量在同一语义空间
* **效果**：减少语义匹配漏检

### 3. 文档切分策略（Chunking）

* 文档切分过大 → 相似度被稀释
* 文档切分过小 → 语义不完整
* 中文 300~800 字符为常用区间
* 保留标题、章节信息，增加 overlap
* **效果**：提高语义召回命中率

### 4. 多路召回（Hybrid / Mixed Retrieval）

* 不仅依赖向量检索，还可以加入：

    * 关键词检索（BM25 / Elasticsearch）
    * 结构化属性 / 标签 / 时间
* 候选集合并（去重 + Score 融合）
* **效果**：提高召回率

### 5. TopK 调整与召回优化

* 向量检索 TopK 不宜太小
* 候选集稍大 → 后续 Rerank 精排
* 结合过滤条件（如时间、分类）降低噪声
* **效果**：更多相关文档进入候选集，提高召回率

### 6. 其他优化手段

* **Embedding 微调**：使用业务问答数据做向量微调
* **缓存热点查询结果**：保证重复 query 不漏文档
