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