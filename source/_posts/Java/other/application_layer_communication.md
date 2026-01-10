---
title: Java 网络通信
categories: [ Java, JavaWeb ]
date: 2025-09-23 20:34:13
tags: [ Java, communication, network, application layer ]
permalink: /other/application_layer_communication/
---

# Java 网络通信

## 前言

Java 是如何和外部服务进行通信的？如何接受请求和发送响应？常见的通信方式有哪些？它们各自的特点和适用场景是什么？

下面介绍将从应用层的角度介绍目前 Java 系统使用的主流的通信方式，我们不关心传输层细节（TCP/UDP），而是关注应用层协议和通信模式，同时会介绍主流的通信框架。

---

## 总览

| 通信方式           | 同步/异步       | 协议/风格                     | 典型用途              | 主要特点              |
|----------------|-------------|---------------------------|-------------------|-------------------|
| HTTP/REST      | 同步为主（可异步）   | HTTP + JSON/XML           | 微服务、Web API、前后端交互 | 简单、通用、工具链成熟、跨语言   |
| gRPC           | 同步 / 流式（双向） | HTTP/2 + Protocol Buffers | 高性能服务间调用、内部系统通信   | 高性能、强类型、支持流、多语言   |
| WebSocket      | 全双工异步       | WebSocket 协议              | 聊天、实时通知、在线协作      | 持久连接、低延迟、服务器可主动推送 |
| 消息队列（MQ）       | 异步          | 自定义协议（AMQP, Kafka 协议等）    | 解耦、削峰、事件驱动、日志收集   | 可靠投递、高吞吐、支持发布/订阅  |
| 自定义 TCP/UDP 协议 | 可同步可异步      | 应用自定义                     | 游戏、IoT、高频交易       | 灵活、高效，但开发运维成本高    |

---

## HTTP

HTTP 是目前最常用的通信方式。

Java 使用 HTTP 通信，本质是：作为 HTTP Client 或 HTTP Server，构造和解析 HTTP 报文。

HTTP 报文包括：
> Request Line / Status Line
> Headers
> Body

### Java HTTP Client

1. JDK 原生 HttpURLConnection

```java
URL url = new URL("https://api.example.com/data");
HttpURLConnection conn = (HttpURLConnection) url.openConnection();

conn.setRequestMethod("GET");
conn.setConnectTimeout(3000);
conn.setReadTimeout(5000);

int code = conn.getResponseCode();
InputStream in = conn.getInputStream();
```

2. `java.net.http.HttpClient` (Java 11+)
   同步请求：

```java
HttpClient client = HttpClient.newHttpClient();

HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("https://api.example.com/data"))
    .GET()
    .build();

HttpResponse<String> response =
    client.send(request, HttpResponse.BodyHandlers.ofString());
```

异步请求：

```java
client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
      .thenAccept(resp -> System.out.println(resp.body()));
```

3. `Apache HttpClient`

```java
CloseableHttpClient client = HttpClients.createDefault();
HttpGet get = new HttpGet("https://api.example.com/data");

CloseableHttpResponse resp = client.execute(get);
```

4. `Spring WebClient` (推荐使用)

```java
WebClient client = WebClient.create("https://api.example.com");

String body = client.get()
    .uri("/data")
    .retrieve()
    .bodyToMono(String.class)
    .block();
```

### Java HTTP Server

1. JDK 原生 HttpServer

```java
HttpServer server = HttpServer.create(new InetSocketAddress(8080), 0);
server.createContext("/hello", exchange -> {
    byte[] resp = "hello".getBytes();
    exchange.sendResponseHeaders(200, resp.length);
    exchange.getResponseBody().write(resp);
});
server.start();
```

2. Servlet API

```java
@WebServlet("/hello")
public class HelloServlet extends HttpServlet {
    protected void doGet(...) {
        resp.getWriter().write("hello");
    }
}
```

3. Spring MVC

```java
@GetMapping("/hello")
public String hello() {
    return "hello";
}
```

4. WebFlux（HTTP 非阻塞 Server）

```java
@GetMapping("/hello")
public Mono<String> hello() {
    return Mono.just("hello");
}
```

### HTTP 轮询

HTTP 轮询（Polling）是一种**客户端定期向服务器发起 HTTP 请求，以检查是否有新数据**的通信模式。它是 Web 应用中实现“近似实时”更新的最简单、最传统的方式。

> WebSocket、SSE 已能提供真正的实时通信，轮询因其**简单、兼容性好、调试方便**，可在简单场景使用

#### 基本原理

1. **客户端**每隔固定时间（如 2 秒）自动发送一次 HTTP 请求
2. **服务器**收到请求后，立即返回当前最新的数据（无论是否有更新）
3. **客户端**收到响应后，处理数据，并等待下一次轮询

{% mermaid %}
sequenceDiagram
    participant Client
    participant Server
    loop 每隔 N 秒
        Client->>Server: GET /data
        Server-->>Client: { "items": [...] }
        Client->>Client: 更新 UI
    end
{% endmermaid %}

#### **短轮询（Short Polling）**

- 客户端定时发起请求，服务器**立即响应**（无论有无新数据）
- **最常见形式**，即通常所说的“HTTP 轮询”

优点：实现简单、兼容所有浏览器和服务器  
缺点：
- 大量无效请求（无新数据时也请求）
- 延迟高（最长可达轮询间隔）
- 浪费带宽和服务器资源

> 示例：每 5 秒查一次消息，即使 1 小时没新消息，也会发 720 次请求。

---

#### **长轮询（Long Polling）**
- 客户端发起请求后，**服务器不立即响应**，而是**挂起请求**，直到有新数据或超时
- 一旦有数据，服务器立刻返回；客户端收到后**立即发起下一次请求**

{% mermaid %}
sequenceDiagram
    participant Client
    participant Server
    Client->>Server: GET /data (请求1)
    Note right of Server: 无数据，挂起
    Server-->>Client: { "new": true } (5秒后有数据)
    Client->>Client: 处理数据
    Client->>Server: GET /data (请求2，立即发起)
{% endmermaid %}

优点：
- 减少无效请求
- 延迟更低（接近实时）
缺点：
- 服务器需维持大量挂起连接（占用线程/内存）
- 实现比短轮询复杂
- 仍基于请求-响应模型，无法真正“推送”

> 注意：长轮询**不是 WebSocket**，它仍是 HTTP 请求，只是响应被延迟了。

---

## Spring MVC

**Spring MVC** 是 **Spring Framework** 提供的基于 Servlet 的 Web MVC（Model-View-Controller） 框架，是当前最主流的 Web 框架，用于构建 Web 应用和 REST API，实现 Web 层的职责分离与松耦合架构。

> REST（Representational State Transfer，表述性状态转移）是一种软件架构风格，其核心思想是：**通过统一接口，对“资源”的“表述”进行操作，实现客户端与服务器的解耦。**
> RESTful API 是一种 REST 架构风格，RESTful API 的核心是：**通过 HTTP 方法（GET、POST、PUT、DELETE等）对资源进行操作，实现客户端与服务器的解耦。**

### 1. **MVC 分层架构：关注点分离**
- **Model（模型）**：封装业务数据和逻辑（如 Service、DAO、Domain 领域对象），不关心如何展示。
- **View（视图）**：负责数据呈现，不包含业务逻辑。
- **Controller（控制器）**：接收用户请求，调用 Model 处理业务，并选择合适的 View 渲染结果。  

### 2. **前端控制器（DispatcherServlet）统一调度**
- 所有 HTTP 请求首先由 **`DispatcherServlet`** 接收，作为唯一入口。
- 它协调 **HandlerMapping**（找控制器）、**HandlerAdapter**（调用方法）、**ViewResolver**（解析视图）等组件完成处理流程。  

### 3. **声明式编程与注解驱动**
- 使用 `@Controller`、`@RequestMapping`、`@ResponseBody` 等注解定义路由和行为。
- 无需继承特定类或实现接口，开发更简洁灵活。  

### 4. **与 Spring 框架深度集成**
- 控制器、服务、数据访问对象均可通过 **依赖注入（DI）** 自动装配。
- 天然支持 AOP、事务管理、国际化、验证等 Spring 特性。  

### 5. **灵活的视图与数据格式支持**
- 支持 Thymeleaf、Freemarker 等多种视图技术。
- 通过 `HttpMessageConverter` 轻松返回 JSON、XML 等 RESTful 响应。  

> **Spring MVC 的核心思想是以 MVC 模式为基础，通过前端控制器统一调度、注解驱动开发、与 Spring 容器无缝集成，实现 Web 层的解耦、复用与高效开发。**

---

## Spring WebFlux

Spring WebFlux 是 Spring Framework 5.0（2017 年）引入的**响应式、非阻塞、异步**的 Web 框架，用于构建高并发、低资源消耗的现代 Web 应用，是对传统基于 Servlet 的 **Spring MVC（阻塞式）** 的补充。

### 1. 响应式编程（Reactive Programming）

WebFlux 基于 **响应式流（Reactive Streams）规范**（由 Java 9 引入 `java.util.concurrent.Flow`），核心目标是：

> **用少量线程处理大量并发请求，避免线程阻塞，提升系统吞吐量和资源利用率。**

**关键特性：**
- **非阻塞 I/O**：不等待 I/O（如数据库、HTTP 调用）完成，而是注册回调。
- **背压（Backpressure）**：消费者控制数据流速，防止生产者压垮系统。
- **事件驱动**：基于事件循环（Event Loop）模型处理请求。

### 2. 两种编程模型

WebFlux 支持 **两种开发风格**，但底层都是响应式的：

**注解式控制器（@Controller）**

语法与 Spring MVC 几乎一致，但返回值为响应式类型。

```java
@RestController
public class UserController {

    @GetMapping("/users/{id}")
    public Mono<User> getUser(@PathVariable String id) {
        return userService.findById(id); // 返回 Mono（0 或 1 个元素）
    }

    @GetMapping("/users")
    public Flux<User> getAllUsers() {
        return userService.findAll(); // 返回 Flux（0 到 N 个元素）
    }
}
```
注意：方法内部必须使用响应式依赖（如 R2DBC、WebClient），否则仍会阻塞。

**函数式端点（Functional Endpoints）**

使用 Lambda 表达式和路由函数定义 API，更函数式、更灵活。

```java
@Configuration
public class UserRouter {

    @Bean
    public RouterFunction<ServerResponse> userRoutes(UserHandler handler) {
        return route(GET("/users/{id}"), handler::getUser)
               .andRoute(GET("/users"), handler::getAllUsers);
    }
}

@Component
public class UserHandler {
    public Mono<ServerResponse> getUser(ServerRequest request) {
        String id = request.pathVariable("id");
        return userService.findById(id)
                .flatMap(user -> ok().bodyValue(user))
                .switchIfEmpty(notFound().build());
    }
}
```

优点：无反射、启动更快、适合动态路由或 DSL 场景。

### 3. 响应式生态（核心）

WebFlux 本身不处理 I/O，它依赖**全链路响应式组件**才能发挥优势：

| 功能       | 响应式方案                                  | 阻塞式方案（不兼容 WebFlux）                           |
|----------|----------------------------------------|----------------------------------------------|
| HTTP 客户端 | **WebClient**（推荐）                      | RestTemplate（已废弃）                            |
| 数据库访问    | **R2DBC**（关系型）、MongoDB Reactive Driver | JDBC、JPA/Hibernate                           |
| 消息队列     | Reactor Kafka、Reactive RabbitMQ        | JMS、Spring Kafka（阻塞）                         |
| 网络层      | **Netty**（默认）、Undertow                 | Tomcat、Jetty（仅支持 Servlet，不能用于 WebFlux 非阻塞模式） |

> **关键原则：整个调用链必须是非阻塞的！**  
> 如果在 WebFlux 中调用 `Thread.sleep()` 或 JDBC，会阻塞 Event Loop 线程，导致性能严重下降。

### 4. 运行时容器

WebFlux **不依赖 Servlet API**，因此可在以下服务器运行：

- **Netty**（默认，高性能异步网络框架）
- **Undertow**
- **Servlet 3.1+ 容器**（如 Tomcat、Jetty）—— 但此时只是“兼容运行”，无法发挥非阻塞优势

### 5. 典型应用场景

1. **API 网关**（如 Spring Cloud Gateway 基于 WebFlux）
2. **实时数据推送**（结合 WebSocket + Flux 流）
3. **高并发微服务**（如每秒数万请求的轻量服务）
4. **事件驱动架构**（与 Kafka、RabbitMQ 响应式集成）

> **Spring WebFlux 是 Spring 生态中面向高并发、低延迟场景的响应式 Web 框架。它通过非阻塞 I/O 和响应式流，用极少线程处理海量连接，但要求全链路（数据库、客户端、中间件）都支持响应式。它不是 MVC 的替代品，而是特定场景下的有力补充。**

---

## SSE

**SSE**（Server-Sent Events，服务器发送事件）是一种基于 HTTP 协议的单向、实时、文本流式通信技术，允许服务器主动向客户端（通常是浏览器）推送数据，而无需客户端轮询。

由 HTML5 规范定义，是现代 Web 开发中实现“服务端主动通知”的轻量级方案。

本质是：
> 在一个 HTTP 连接上，服务器可以不断向客户端推送数据，而不需要客户端反复发请求。

**特点**

| 特性            | 说明                                                    |
|---------------|-------------------------------------------------------|
| 单向通信          | 仅 服务器 → 客户端，客户端不能通过 SSE 向服务器发消息                       |
| 基于 HTTP/HTTPS | 使用标准 HTTP 协议，无需特殊端口或协议（如 WebSocket 需要 `ws://`）        |
| 自动重连          | 客户端断开后会自动尝试重连（可配置重试间隔）                                |
| 文本流格式         | 数据以 UTF-8 文本形式按行推送，支持 JSON、纯文本等                       |
| 浏览器原生支持       | 现代浏览器（Chrome、Firefox、Edge、Safari）内置 `EventSource` API |
| 不支持 IE        | Internet Explorer 所有版本均不支持（可通过 polyfill 降级）           |
| 不支持二进制数据      | 仅限文本，大文件或音视频需用其他方案（如 WebSocket）                       |



SSE 的响应：
```http
HTTP/1.1 200 OK
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

按照 SSE 协议格式发送文本块，每条消息以 `data:` 开头，以两个换行符 `\n\n` 结尾：
```text
data: {"time": "15:30", "msg": "新订单到达"}\n\n
data: {"time": "16:30", "msg": "新订单到达"}\n\n

data: {"time": "17:30", "msg": "新订单到达"}\n\n
```

断线自动重连：

若连接中断，浏览器默认每 3 秒重试一次（可通过 `retry: 5000` 自定义）。

### SSE 协议规范

每条消息由若干字段组成，空行表示消息结束：

```text
event: notification        // 可选：自定义事件类型（默认为 "message"）
id: 123                    // 可选：消息 ID，用于断线后恢复（Last-Event-ID）
data: 这是一条消息         // 必填：消息内容（可多行）
data: 支持多行拼接
retry: 5000                // 可选：重连间隔（毫秒）
```

### Spring MVC 中的 SSE

Spring 提供了 `SseEmitter`，作为**SSE 协议编码器 + HTTP 流写入器**。

在 Java 中调用
```java
emitter.send("hello");
```

Spring 会在底层格式化为：
```kotiln
data: hello\n\n
```

Spring 中使用示例：
```java
@GetMapping("/stream")
public SseEmitter stream() {
    SseEmitter emitter = new SseEmitter();
    new Thread(() -> {
        emitter.send("A");
        emitter.send("B");
        emitter.send("C");
    }).start();
    return emitter;
}
```

**SSE 在 Spring MVC 中的线程模型**

基本线程模型：Servlet 容器线程 + 长时间占用

**请求处理流程**：
- 客户端发起 SSE 请求
- Servlet 容器（如 Tomcat）从**线程池**中分配一个工作线程（Worker Thread）处理该请求
- Controller 方法返回 `SseEmitter`（或 `ResponseBodyEmitter`）
- Spring **不立即结束响应**，而是保持 `HttpServletResponse.getOutputStream()` 打开
- 该线程**持续持有连接**，用于后续调用 `emitter.send(...)` 向客户端写数据

每个 SSE 连接独占一个 Servlet 线程，线程长时间阻塞，不会被释放回池，直到连接关闭。 

这与 **WebFlux + Netty** 的模型形成鲜明对比：
- WebFlux 使用少量 Event Loop 线程（如 4 个）可支撑数万 SSE 连接
- 因为 Netty 是非阻塞 I/O，连接不绑定线程

**Spring MVC 中的 SSE 是“伪异步”——它利用 Servlet 异步特性延长响应，但底层仍依赖阻塞 I/O 和线程绑定，无法实现真正的高并发。若需支持大量 SSE 连接，需要优先考虑 WebFlux。**

---

## WebSocket

WebSocket 是一种**在单个 TCP 连接上实现全双工、双向、实时通信**的网络协议，专为 Web 应用设计。它解决了传统 HTTP 协议在实时交互场景下的根本性限制（如轮询开销大、延迟高、无法服务器主动推送等）。

**传统 HTTP 的局限：**
- **请求-响应模型**：客户端必须先发起请求，服务器才能响应。
- **无状态**：每次请求独立，无法维持会话上下文（除非靠 Cookie/Session）。
- **高延迟 & 高开销**：
    - 轮询（Polling）：频繁空请求浪费带宽和 CPU。
    - 长轮询（Long Polling）：连接挂起占用服务器资源。
- **无法真正“推送”**：服务器有新数据时，不能主动通知客户端。

> **WebSocket 的目标**：建立一个**持久、低延迟、双向、轻量**的通信通道。

### WebSocket 核心特性

| 特性               | 说明                                      |
|------------------|-----------------------------------------|
| **全双工通信**        | 客户端和服务器可**同时、独立地发送数据**，互不阻塞             |
| **单 TCP 连接**     | 建立后复用同一个连接，避免重复握手开销                     |
| **低延迟**          | 数据可立即发送，无需等待请求                          |
| **轻量级协议头**       | 数据帧头部仅 2~14 字节（HTTP 头通常几百字节）            |
| **兼容 HTTP 基础设施** | 使用 `ws://`（80）或 `wss://`（443），可穿透防火墙和代理 |
| **支持文本 & 二进制**   | 可传输 JSON、Protobuf、音视频流等                 |

---

### WebSocket 生命周期

#### 阶段 1：**握手（Handshake）**
客户端通过 HTTP 发起“协议升级”请求：

```http
GET /chat HTTP/1.1
Host: example.com
Upgrade: websocket          // 请求升级为 WebSocket
Connection: Upgrade         // 表示要切换协议
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==  // 随机 Base64 字符串
Sec-WebSocket-Version: 13   // 协议版本
```

服务器验证并响应：

```http
HTTP/1.1 101 Switching Protocols
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=  // Key 经 SHA1+Base64 计算得出
```

> - 握手是标准的 HTTP 请求/响应
> - 状态码 `101` 表示“协议切换成功”
> - 此后，**TCP 连接被“接管”为 WebSocket 连接**


#### 阶段 2：**数据传输（Data Framing）**
握手成功后，双方通过 **WebSocket 帧（Frame）** 交换数据：

开发者通常**无需关心帧细节**，由浏览器/库自动处理。


#### 阶段 3：**连接关闭（Closing Handshake）**
任一方可发送 **关闭帧**，对方应回应相同帧，实现优雅关闭。

```javascript
// JavaScript 示例
socket.close(1000, "正常关闭"); // 1000 是标准关闭码
```

常见关闭码：
- `1000`：正常关闭
- `1001`：终端离开（如页面关闭）
- `1006`：连接异常中断（无关闭帧）

> **WebSocket 是为实时 Web 应用而生的革命性协议**：
> - 它通过一次 HTTP 握手建立持久化 TCP 通道，
> - 实现客户端与服务器之间的**低延迟、全双工、双向通信**，
> - 彻底摆脱了 HTTP 请求-响应模型的束缚，
> - 成为聊天、游戏、金融、IoT 等实时场景的**事实标准**。


虽然增加了服务器复杂度，但在现代云原生架构（如 Kubernetes + WebSocket Gateway）下，已能高效支撑百万级并发连接。

### Spring 中使用 WebSocket

Spring Framework 提供了对 WebSocket 的原生支持，主要通过 `spring-boot-starter-websocket` 模块实现。支持两种主要方式：

1. **基于 STOMP 协议的 WebSocket**（推荐方式）：提供消息代理（Broker）支持，实现发布/订阅模式，适合复杂实时应用。
2. **原生 WebSocket API**（JSR-356）：更底层，适合简单场景。

**下面重点介绍 Spring 原生 WebSocket （含 STOMP）**

#### 1. 添加依赖

在 `pom.xml` 中添加：

```xml
    <!-- Spring WebSocket 支持 -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-websocket</artifactId>
</dependency>
        <!-- Spring Boot Web Starter -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>
```

#### 2. 配置 WebSocket

创建一个配置类，实现 `WebSocketConfigurer`，注册 STOMP 端点并启用 SockJS。

```java
@Configuration
@EnableWebSocketMessageBroker  // 启用 STOMP 消息代理
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // 注册 WebSocket 端点，客户端将连接此路径
        // 启用 SockJS 回退选项，兼容不支持 WebSocket 的浏览器
        registry.addEndpoint("/ws").withSockJS();
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        // 启用简单内置消息代理，用于广播消息
        // 客户端订阅的前缀为 "/topic" 和 "/queue"
        registry.enableSimpleBroker("/topic", "/queue");

        // 应用前缀：客户端发送消息的目标前缀
        registry.setApplicationDestinationPrefixes("/app");
    }
}
```

#### 3. 创建消息处理控制器

使用 `@Controller` 和 STOMP 注解处理消息。

```java
@Controller
public class WebSocketController {

    // 客户端发送消息到 "/app/hello" 时触发此方法
    // 返回的消息会自动广播到 "/topic/greetings"
    @MessageMapping("/hello")
    @SendTo("/topic/greetings")
    public String handleGreeting(String message) {
        return "Server received: " + message;
    }
}
```

---

## WebSocket vs HTTP vs SSE

| 特性        | WebSocket       | HTTP (短/长轮询)   | SSE (Server-Sent Events) |
|-----------|-----------------|----------------|--------------------------|
| **通信方向**  | 双向              | 单向（客户端→服务器）    | 单向（服务器→客户端）              |
| **协议层级**  | 应用层（独立协议）       | 应用层            | 基于 HTTP 流                |
| **连接持久性** | 持久              | 短连接 / 挂起连接     | 持久 HTTP 流                |
| **数据格式**  | 文本 + 二进制        | 任意             | 仅文本（UTF-8）               |
| **浏览器支持** | IE10+           | 全部             | IE 不支持                   |
| **服务器压力** | 低（单连接复用）        | 高（轮询） / 中（长轮询） | 中（每个连接占线程）               |
| **适用场景**  | 聊天、游戏、协同编辑、实时交易 | 低频更新、兼容旧系统     | 实时通知、日志流、股票行情            |

---

