---
title: 在 SpringBoot 中使用 Docker
date: 2025-12-22 00:10:18
categories: [ DevOps ]
tags: [ docker, 容器化, DevOps, CI/CD, SpringBoot, Java ]
permalink: /DevOps/UsingDockerInSpringBoot/
---

# 在 SpringBoot 中使用 Docker

## 一、为什么要在 SpringBoot 中使用 Docker？

### 1.1 环境一致性

在传统的 SpringBoot 开发流程中，开发、测试、预发和生产环境往往存在差异（如 JDK 版本、操作系统、依赖库等）。将 SpringBoot 应用容器化后，应用及其完整运行时环境被"固化"在镜像中，确保在任何支持 Docker 的平台上行为一致。

### 1.2 依赖隔离

SpringBoot 应用通常依赖特定版本的 JDK、系统库和环境变量。容器提供了独立的文件系统和运行时，彻底避免了不同应用间的依赖冲突。

### 1.3 快速部署与弹性伸缩

容器镜像可预先构建并缓存，部署仅需拉取镜像并启动容器。结合编排系统（如 Kubernetes），可实现秒级扩缩容，应对流量高峰。

### 1.4 微服务架构支持

SpringBoot 是微服务架构的主流选择，而 Docker 天然支持微服务的独立部署、升级和管理，每个微服务可独立打包、部署、扩展。

---

## 二、SpringBoot 应用容器化基础

### 2.1 SpringBoot 应用打包特点

SpringBoot 应用通常被打包为可执行 JAR 文件，内置了 Tomcat/Jetty/Undertow 等嵌入式 Web 服务器。这种打包方式使得应用可以在任何安装了 JRE 的环境中运行，而 Docker 则进一步将 JRE 和应用打包在一起，实现完全的环境隔离。

### 2.2 容器化最佳实践

在将 SpringBoot 应用容器化时，需要考虑以下关键点：

- **JVM 调优**：容器环境下的内存和 CPU 限制与传统环境不同
- **健康检查**：利用 Spring Boot Actuator 提供健康检查端点
- **配置外部化**：通过环境变量或配置文件实现配置外部化
- **日志管理**：将应用日志输出到标准输出流，便于容器日志收集

---

## 三、SpringBoot Docker 实践操作

### 3.1 基础 Dockerfile

为 SpringBoot 应用编写 Dockerfile 是容器化的第一步：

```
# 使用官方 Eclipse Temurin 基础镜像
FROM eclipse-temurin:25-jre-alpine

# 设置工作目录
WORKDIR /app

# 复制 JAR 文件到容器中
COPY target/*.jar app.jar

# 暴露应用端口（默认 8080）
EXPOSE 8080

# 设置 JVM 参数并运行应用
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
```

#### **Dockerfile 关键配置说明**

- **基础镜像选择**：推荐使用 `eclipse-temurin:25-jre-alpine`，体积更小
- **JAR 文件复制**：将 Maven/Gradle 构建生成的 JAR 文件复制到容器
- **JVM 参数优化**：`-Djava.security.egd=file:/dev/./urandom` 解决容器中随机数生成慢的问题
- **启动命令**：使用 `ENTRYPOINT` 而非 `CMD`，确保参数传递正确

### 3.2 Dockerfile 多阶段构建

为了减小镜像大小和提高安全性，可以使用多阶段构建：

```
# 构建阶段
FROM maven:3.9-eclipse-temurin-25 AS build

# 设置工作目录
WORKDIR /app

# 复制项目文件
COPY pom.xml .
COPY src ./src

# 编译构建
RUN mvn clean package -DskipTests

# 运行阶段
FROM eclipse-temurin:25-jre-alpine

# 创建非 root 用户
RUN addgroup -g 1001 -S appuser && \
    adduser -u 1001 -S appuser -G appuser

WORKDIR /app

# 从构建阶段复制 JAR 文件
COPY --from=build /app/target/*.jar app.jar

# 更改文件所有者
RUN chown appuser:appuser /app/app.jar

# 切换到非 root 用户
USER appuser

# 暴露端口
EXPOSE 8080

# 启动应用
ENTRYPOINT ["java", "-Djava.security.egd=file:/dev/./urandom", "-jar", "/app/app.jar"]
```

#### **多阶段构建优势**

- **镜像体积更小**：运行时镜像不包含构建工具和源码
- **安全性更高**：使用非 root 用户运行应用
- **构建缓存优化**：利用 Docker 构建缓存机制提升构建速度

### 3.3 Docker Compose 集成

在实际项目中，SpringBoot 应用通常需要连接数据库、缓存等外部服务，使用 Docker Compose 可以方便地管理多容器应用：

```yaml
services:
  # SpringBoot 应用服务
  app:
    build: .
    ports:
      - "8080:8080"
    environment:
      - SPRING_PROFILES_ACTIVE=docker
      - SPRING_DATASOURCE_URL=jdbc:mysql://db:3306/myapp
      - SPRING_DATASOURCE_USERNAME=root
      - SPRING_DATASOURCE_PASSWORD=password
    depends_on:
      - db
      - redis
    networks:
      - app-network

  # MySQL 数据库服务
  db:
    image: mysql:9
    environment:
      MYSQL_ROOT_PASSWORD: password
      MYSQL_DATABASE: myapp
    ports:
      - "3306:3306"
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network

  # Redis 缓存服务
  redis:
    image: redis:8-alpine
    ports:
      - "6379:6379"
    networks:
      - app-network

volumes:
  db-data:

networks:
  app-network:
    driver: bridge
```

#### **Docker Compose 配置说明**

- **环境变量**：通过环境变量传递配置信息，实现配置外部化
- **服务依赖**：使用 `depends_on` 确保服务启动顺序
- **网络隔离**：使用自定义网络实现服务间通信
- **数据持久化**：使用命名卷持久化数据库数据

### 3.4 SpringBoot 应用配置优化

为了更好地适应容器化环境，需要对 SpringBoot 应用进行一些配置优化：

#### **application-docker.yml 配置示例**

```
server:
  port: 8080

# JVM 和容器相关配置
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
  health:
    probes:
      enabled: true

# 数据库连接池配置
spring:
  datasource:
    url: ${SPRING_DATASOURCE_URL:jdbc:mysql://localhost:3306/myapp}
    username: ${SPRING_DATASOURCE_USERNAME:root}
    password: ${SPRING_DATASOURCE_PASSWORD:password}
    hikari:
      maximum-pool-size: 10
      minimum-idle: 2
      connection-timeout: 30000
      idle-timeout: 600000
      max-lifetime: 1800000

  # Redis 配置
  redis:
    host: ${SPRING_REDIS_HOST:localhost}
    port: ${SPRING_REDIS_PORT:6379}
    timeout: 2000ms
    lettuce:
      pool:
        max-active: 20
        max-idle: 10
        min-idle: 5

# 日志配置
logging:
  level:
    com.yourpackage: INFO
  pattern:
    console: "%d{yyyy-MM-dd HH:mm:ss} - %msg%n"
```
> SpringBoot 的配置加载机制可以参考这份文档： [SpringBoot 配置加载机制与容器化适配](https://yuuine.cn/categories/DevOps/SpringBootConfigContainerAdaptation/)

#### **容器化相关的 JVM 参数**

在容器环境中，需要特别注意 JVM 的内存和 CPU 设置：

```
ENTRYPOINT ["java", 
  "-Djava.security.egd=file:/dev/./urandom",
  "-XX:+UseContainerSupport",           # 启用容器支持
  "-XX:MaxRAMPercentage=75.0",         # 使用容器内存的 75% 作为堆内存
  "-XX:InitialRAMPercentage=25.0",     # 使用容器内存的 25% 作为初始堆内存
  "-XX:+UseG1GC",                      # 使用 G1 垃圾收集器
  "-XX:+UnlockExperimentalVMOptions", 
  "-XX:+UseContainerSupport", 
  "-Dspring.profiles.active=docker",
  "-jar", "/app/app.jar"]
```

## 四、高级实践与监控

### 4.1 健康检查配置

SpringBoot Actuator 提供了丰富的监控端点，可以配置 Docker 健康检查：

```
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD curl -f http://localhost:8080/actuator/health || exit 1
```

### 4.2 构建与部署脚本

创建构建脚本 `build.sh`：

```
#!/bin/bash

# 构建 SpringBoot 应用
./mvnw clean package -DskipTests

# 构建 Docker 镜像
docker build -t my-springboot-app:latest .

# 可选：推送镜像到仓库
# docker push my-springboot-app:latest
```

### 4.3 CI/CD 集成

在 CI/CD 流程中集成 Docker 构建：

```
# GitHub Actions 示例
name: Build and Push Docker Image

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Set up JDK 25
      uses: actions/setup-java@v2
      with:
        java-version: '25'
        distribution: 'temurin'
    
    - name: Build with Maven
      run: ./mvnw clean package -DskipTests
    
    - name: Build Docker image
      run: |
        docker build -t my-springboot-app:${{ github.sha }} .
        docker tag my-springboot-app:${{ github.sha }} my-springboot-app:latest
    
    - name: Push Docker image
      run: |
        echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
        docker push my-springboot-app:${{ github.sha }}
        docker push my-springboot-app:latest
```

---