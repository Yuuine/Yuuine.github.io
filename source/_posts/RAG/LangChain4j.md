---
title: 详解 LangChain4j
date: 2025-12-24 22:24:48
categories: [ RAG ]
tags: [ LangChain4j, AI, Java, LLM, RAG ]
permalink: /rag/LangChain4j/
---

# LangChain4j

## 一、什么是 LangChain4j？

LangChain4j 是 Java 版本的 LangChain 库，为 Java 开发者提供了构建基于大语言模型（LLM）应用的框架。它提供了丰富的组件和工具，简化了 LLM 应用的开发流程。

### 1.1 主要特性

- **多模型支持**：支持 OpenAI、Anthropic、Google、Azure OpenAI 等多种 LLM 服务
- **链式调用**：提供链式 API，便于构建复杂的 LLM 应用
- **内存管理**：内置对话记忆功能，支持多轮对话
- **工具集成**：支持函数调用和外部工具集成
- **向量存储**：集成多种向量数据库，支持 RAG 应用
- **Agent 智能体**：支持智能体模式，可自主决策和执行任务

### 1.2 核心组件

- **LanguageModel**：语言模型接口，支持各种 LLM
- **EmbeddingModel**：嵌入模型，用于向量化文本
- **ChatMemory**：对话记忆，维护对话历史
- **Tool**：工具接口，支持外部功能调用
- **Retriever**：检索器，支持 RAG 应用

## 二、环境准备与依赖配置

### 2.1 Maven 依赖配置

推荐使用 langchain4j-bom 管理版本。

在 `pom.xml` 中配置：
```xml
<dependencyManagement>
    <dependencies>
        <dependency>
            <groupId>dev.langchain4j</groupId>
            <artifactId>langchain4j-bom</artifactId>
            <version>1.9.1</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>

<dependencies>
    <!-- LangChain4j 核心库 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j</artifactId>
    </dependency>
    
    <!-- OpenAI 集成 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-open-ai</artifactId>
    </dependency>
    
    <!-- 向量存储 - Chroma -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-chroma</artifactId>
    </dependency>
    
    <!-- 向量存储 - Qdrant -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-qdrant</artifactId>
    </dependency>
    
    <!-- Spring Boot 集成 -->
    <dependency>
        <groupId>dev.langchain4j</groupId>
        <artifactId>langchain4j-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

### 2.2 环境变量配置

在 `.env` 文件或系统环境中配置 API 密钥：

```bash
OPENAI_API_KEY=your_openai_api_key
ANTHROPIC_API_KEY=your_anthropic_api_key
QDRANT_HOST=your_qdrant_host
QDRANT_API_KEY=your_qdrant_api_key
```

## 三、基础用法

### 3.1 简单聊天模型调用

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiChatModel;

public class SimpleChatExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-4o-mini")
                .build();
        
        String response = model.generate("你好，介绍一下自己");
        System.out.println(response);
    }
}
```

### 3.2 使用流式响应

```java
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.openai.OpenAiStreamingChatModel;

public class StreamingChatExample {
    public static void main(String[] args) {
        StreamingChatLanguageModel model = OpenAiStreamingChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .modelName("gpt-4o-mini")
                .build();
        
        model.generate("请写一首诗", token -> System.out.print(token.content()));
    }
}
```

### 3.3 对话记忆功能

```java
import dev.langchain4j.memory.ChatMemory;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.service.AiServices;

public class ChatMemoryExample {
    interface Assistant {
        String chat(String userMessage);
    }
    
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
        
        ChatMemory chatMemory = MessageWindowChatMemory.builder()
                .maxMessages(10)
                .build();
        
        Assistant assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(model)
                .chatMemory(chatMemory)
                .build();
        
        System.out.println(assistant.chat("你好"));
        System.out.println(assistant.chat("我的名字是张三"));
        System.out.println(assistant.chat("还记得我的名字吗？"));
    }
}
```

## 四、高级功能

### 4.1 函数调用（工具调用）

```java
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.service.UserMessage;

public class ToolExample {
    static class Calculator {
        @Tool("计算两个数字的和")
        public double add(double a, double b) {
            return a + b;
        }
        
        @Tool("计算两个数字的乘积")
        public double multiply(double a, double b) {
            return a * b;
        }
    }
    
    interface Assistant {
        String chat(@UserMessage String userMessage);
    }
    
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
        
        Assistant assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(model)
                .tools(new Calculator())
                .build();
        
        System.out.println(assistant.chat("请计算 23.5 + 17.8 的结果"));
    }
}
```

### 4.2 RAG（检索增强生成）

```java
import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.loader.FileSystemDocumentLoader;
import dev.langchain4j.data.document.parser.TextDocumentParser;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.embedding.AllMiniLmL6V2EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.rag.content.retriever.ContentRetriever;
import dev.langchain4j.rag.content.retriever.EmbeddingStoreContentRetriever;
import dev.langchain4j.service.AiServices;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import java.util.List;

public class RagExample {
    interface Assistant {
        String answer(String question);
    }
    
    public static void main(String[] args) {
        Document document = FileSystemDocumentLoader.loadDocument(
                "path/to/your/document.txt", 
                new TextDocumentParser()
        );
        
        AllMiniLmL6V2EmbeddingModel embeddingModel = new AllMiniLmL6V2EmbeddingModel();
        
        List<TextSegment> segments = document.toTextSegments(); // 简化示例，实际可使用 splitter
        
        EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();
        
        List<Embedding> embeddings = embeddingModel.embedAll(segments).content();
        embeddingStore.addAll(embeddings, segments);
        
        ContentRetriever contentRetriever = EmbeddingStoreContentRetriever.builder()
                .embeddingStore(embeddingStore)
                .embeddingModel(embeddingModel)
                .maxResults(2)
                .minScore(0.7)
                .build();
        
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
        
        Assistant assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(model)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .contentRetriever(contentRetriever)
                .build();
        
        String answer = assistant.answer("文档中提到了什么内容？");
        System.out.println(answer);
    }
}
```

### 4.3 Agent 智能体

```java
import dev.langchain4j.agent.tool.Tool;
import dev.langchain4j.memory.chat.MessageWindowChatMemory;
import dev.langchain4j.model.openai.OpenAiChatModel;
import dev.langchain4j.service.AiServices;

import java.util.Date;

public class AgentExample {
    static class Calculator {
        @Tool("计算两个数字的和")
        public double add(double a, double b) {
            return a + b;
        }
        
        @Tool("获取当前时间")
        public String getCurrentTime() {
            return new Date().toString();
        }
    }
    
    interface Agent {
        String chat(String userMessage);
    }
    
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
        
        Agent agent = AiServices.builder(Agent.class)
                .chatLanguageModel(model)
                .chatMemory(MessageWindowChatMemory.withMaxMessages(10))
                .tools(new Calculator())
                .build();
        
        System.out.println(agent.chat("现在是几点？"));
        System.out.println(agent.chat("请计算 15.5 + 24.7 的结果"));
    }
}
```

## 五、Spring Boot 集成

### 5.1 配置文件

在 `application.yml` 中配置 LangChain4j：

```yaml
langchain4j:
  open-ai:
    chat-model:
      api-key: ${OPENAI_API_KEY}
      model-name: gpt-4o-mini
      temperature: 0.7
    embedding-model:
      model-name: text-embedding-3-small
  qdrant:
    host: ${QDRANT_HOST}
    api-key: ${QDRANT_API_KEY}
    port: 6333
    https-enabled: true
```

### 5.2 服务类

```java
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.service.AiServices;
import org.springframework.stereotype.Service;

@Service
public class AiAssistantService {
    
    private final Assistant assistant;
    
    public AiAssistantService(ChatLanguageModel chatLanguageModel) {
        this.assistant = AiServices.builder(Assistant.class)
                .chatLanguageModel(chatLanguageModel)
                .build();
    }
    
    public String respond(String input) {
        return assistant.chat(input);
    }
    
    interface Assistant {
        String chat(String input);
    }
}
```

### 5.3 控制器

```java
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {
    
    private final AiAssistantService aiAssistantService;
    
    public AiController(AiAssistantService aiAssistantService) {
        this.aiAssistantService = aiAssistantService;
    }
    
    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody ChatRequest request) {
        String response = aiAssistantService.respond(request.getMessage());
        return ResponseEntity.ok(response);
    }
    
    static class ChatRequest {
        private String message;
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
    }
}
```

## 六、最佳实践

### 6.1 错误处理

```java
import dev.langchain4j.model.output.Response;

public class ErrorHandlingExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .build();
        
        try {
            Response<String> response = model.generate("你好");
            System.out.println("结果: " + response.content());
        } catch (Exception e) {
            System.err.println("调用失败: " + e.getMessage());
        }
    }
}
```

### 6.2 性能优化

- **连接池配置**：合理配置 HTTP 客户端连接池
- **缓存机制**：对频繁查询的结果进行缓存
- **异步处理**：使用异步 API 提高并发性能
- **批处理**：对批量操作使用批处理机制

### 6.3 安全考虑

- **API 密钥管理**：使用环境变量或密钥管理服务
- **输入验证**：对用户输入进行严格验证
- **访问控制**：实施适当的访问控制策略
- **日志记录**：记录关键操作日志，便于审计

## 七、常见问题与解决方案

### 7.1 API 限流处理

```java
import java.time.Duration;

public class RateLimitExample {
    public static void main(String[] args) {
        ChatLanguageModel model = OpenAiChatModel.builder()
                .apiKey(System.getenv("OPENAI_API_KEY"))
                .timeout(Duration.ofSeconds(60))
                .maxRetries(3)
                .build();
    }
}
```

### 7.2 内存管理

对于长时间运行的对话应用，需要注意内存管理：

```java
ChatMemory chatMemory = MessageWindowChatMemory.builder()
        .maxMessages(20)
        .build();
```