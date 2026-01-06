---
title: 线程池详解
categories: [ Java, juc ]
date: 2025-07-10 18:47:28
tags: [ Java, juc, thread pool ]
permalink: /rag/thread_pool_details/
---

# 线程池详解

## 简介

线程池（Thread Pool）是一种用于管理和复用线程资源的设计模式。它通过预先创建一定数量的线程，并将任务分配给这些线程来执行，从而避免了频繁创建和销毁线程所带来的开销，提高了系统的性能和响应速度。

频繁的创建和销毁线程会导致系统资源的浪费，尤其是在高并发场景下。线程池通过复用现有线程，减少了线程创建和销毁的次数，从而提升了系统的整体效率。

主要好处：

1. **降低资源消耗**：线程池里的线程是可以重复利用的。一旦线程完成了某个任务，它不会立即销毁，而是回到池子里等待下一个任务。这就避免了频繁创建和销毁线程带来的开销。
2. **提高响应速度**：线程池里会维护一定数量的核心线程，任务来了之后，可以直接交给这些已经存在的、空闲的线程去执行，省去了创建线程的时间，任务能够更快地得到处理。
3. **提高线程的可管理性**：线程池允许我们统一管理池中的线程。我们可以配置线程池的大小（核心线程数、最大线程数）、任务队列的类型和大小、拒绝策略等。这样就能控制并发线程的总量，防止资源耗尽，保证系统的稳定性。同时，线程池通常也提供了监控接口，方便我们了解线程池的运行状态（比如有多少活跃线程、多少任务在排队等），便于调优。

---

## Executor 框架

### Java Executor框架介绍

`Executor` 框架是 `java.util.concurrent` 包中提供的并发编程核心组件，自 `Java 5` 引入以来，它显著简化了多线程任务的管理。该框架的核心设计思想是将“任务的提交”与“任务的执行”解耦，从而实现线程的高效复用和管理，避免了直接使用 `Thread` 类带来的资源开销和复杂性。

除此之外，`Executor` 还有助于避免 this 逃逸问题。
> 在传统的多线程编程中，如果一个对象在其构造函数中启动了一个线程，并将 `this` 引用传递给该线程，可能会导致该对象在完全构造之前就被其他线程访问，从而引发不可预期的行为。通过使用 `Executor` 框架，任务的提交和执行被分离，避免了在对象构造过程中启动线程，从而有效防止了 this 逃逸问题。

### ThreadPoolExecutor

线程池实现类 `ThreadPoolExecutor` 是 `Executor` 框架最核心的类。

### 线程池参数分析

`ThreadPoolExecutor` 类中提供的四个构造方法。最全面的构造方法如下：

```java
    /**
     * 用给定的初始参数创建一个新的ThreadPoolExecutor。
     */
    public ThreadPoolExecutor(int corePoolSize,//线程池的核心线程数量
                              int maximumPoolSize,//线程池的最大线程数
                              long keepAliveTime,//当线程数大于核心线程数时，多余的空闲线程存活的最长时间
                              TimeUnit unit,//时间单位
                              BlockingQueue<Runnable> workQueue,//任务队列，用来储存等待执行任务的队列
                              ThreadFactory threadFactory,//线程工厂，用来创建线程，一般默认即可
                              RejectedExecutionHandler handler//拒绝策略，当提交的任务过多而不能及时处理时，我们可以定制策略来处理任务
                               ) {
        if (corePoolSize < 0 ||
            maximumPoolSize <= 0 ||
            maximumPoolSize < corePoolSize ||
            keepAliveTime < 0)
            throw new IllegalArgumentException();
        if (workQueue == null || threadFactory == null || handler == null)
            throw new NullPointerException();
        this.corePoolSize = corePoolSize;
        this.maximumPoolSize = maximumPoolSize;
        this.workQueue = workQueue;
        this.keepAliveTime = unit.toNanos(keepAliveTime);
        this.threadFactory = threadFactory;
        this.handler = handler;
    }
```

`ThreadPoolExecutor` 3 个最重要的参数：

- `corePoolSize` : 任务队列未达到队列容量时，最大可以同时运行的线程数量。
- `maximumPoolSize` : 任务队列中存放的任务达到队列容量的时候，当前可以同时运行的线程数量变为最大线程数。
- `workQueue`: 新任务来的时候会先判断当前运行的线程数量是否达到核心线程数，如果达到的话，新任务就会被存放在队列中。

`ThreadPoolExecutor`其他常见参数 :

- `keepAliveTime`:线程池中的线程数量大于 `corePoolSize` 的时候，如果这时没有新的任务提交，核心线程外的线程不会立即销毁，而是会等待，直到等待的时间超过了 `keepAliveTime`才会被回收销毁。
- `unit` : `keepAliveTime` 参数的时间单位。
- `threadFactory` :executor 创建新线程的时候会用到。
- `handler` :拒绝策略。

---

### 任务队列

| 队列                    | 特点          | 适用场景        |
|-----------------------|-------------|-------------|
| `ArrayBlockingQueue`  | 有界、性能稳定     | **推荐**      |
| `LinkedBlockingQueue` | 默认无界        | **高风险 OOM** |
| `SynchronousQueue`    | 不存任务，直接交给线程 | 高并发、短任务     |
| `DelayQueue`          | 定时任务        | 定时线程池       |


### `ThreadPoolExecutor` 拒绝策略

如果当前同时运行的线程数量达到最大线程数量并且队列也已经被放满了任务时，`ThreadPoolExecutor` 定义一些策略:

- `ThreadPoolExecutor.AbortPolicy`：抛出 `RejectedExecutionException`来拒绝新任务的处理。
- `ThreadPoolExecutor.CallerRunsPolicy`：调用执行自己的线程运行任务，也就是直接在调用`execute`方法的线程中运行(`run`)被拒绝的任务，如果执行程序已关闭，则会丢弃该任务。因此这种策略会降低对于新任务提交速度，影响程序的整体性能。如果您的应用程序可以承受此延迟并且你要求任何一个任务请求都要被执行的话，你可以选择这个策略。
- `ThreadPoolExecutor.DiscardPolicy`：不处理新任务，直接丢弃掉。
- `ThreadPoolExecutor.DiscardOldestPolicy`：此策略将丢弃最早的未处理的任务请求。

快速对比：
| 策略                    | 行为     | 使用建议     |
|-----------------------|--------|----------|
| `AbortPolicy`         | 抛异常    | 默认，快速失败  |
| `CallerRunsPolicy`    | 调用线程执行 | **削峰限流** |
| `DiscardPolicy`       | 丢任务    | 不重要任务    |
| `DiscardOldestPolicy` | 丢最老任务  | 不推荐      |

### 创建线程池

在 Java 中，主要有两种创建线程池的方式
1. 通过 `ThreadPoolExecutor` 构造函数直接创建 (推荐)**

可精确控制所有参数，提供更高的可控性和安全性。
示例：
```java
import java.util.concurrent.*;

ExecutorService customPool = new ThreadPoolExecutor(
    5,                  // corePoolSize
    10,                 // maximumPoolSize
    60L, TimeUnit.SECONDS,  // keepAliveTime
    new ArrayBlockingQueue<>(100),  // 有界队列，容量100
    Executors.defaultThreadFactory(),
    new ThreadPoolExecutor.CallerRunsPolicy()  // 拒绝策略
);
```

2. 通过 `Executors` 工厂类创建

通过`Executors`工具类可以创建多种类型的线程池，包括：

- `FixedThreadPool`：固定线程数量的线程池。该线程池中的线程数量始终不变。当有一个新的任务提交时，线程池中若有空闲线程，则立即执行。若没有，则新的任务会被暂存在一个任务队列中，待有线程空闲时，便处理在任务队列中的任务。
- `SingleThreadExecutor`： 只有一个线程的线程池。若多余一个任务被提交到该线程池，任务会被保存在一个任务队列中，待线程空闲，按先入先出的顺序执行队列中的任务。
- `CachedThreadPool`： 可根据实际情况调整线程数量的线程池。线程池的线程数量不确定，但若有空闲线程可以复用，则会优先使用可复用的线程。若所有线程均在工作，又有新的任务提交，则会创建新的线程处理任务。所有线程在当前任务执行完毕后，将返回线程池进行复用。
- `ScheduledThreadPool`：给定的延迟后运行任务或者定期执行任务的线程池。

《阿里巴巴 Java 开发手册》强制线程池不允许使用 `Executors` 去创建，而是通过 `ThreadPoolExecutor` 构造函数的方式，这样的处理方式能够更加明确线程池的运行规则，规避资源耗尽的风险

`Executors` 返回线程池对象的弊端如下：

- `FixedThreadPool` 和 `SingleThreadExecutor`:使用的是阻塞队列 `LinkedBlockingQueue`，任务队列最大长度为 `Integer.MAX_VALUE`，可以看作是无界的，可能堆积大量的请求，从而导致 OOM。
- `CachedThreadPool`:使用的是同步队列 `SynchronousQueue`, 允许创建的线程数量为 `Integer.MAX_VALUE` ，如果任务数量过多且执行速度较慢，可能会创建大量的线程，从而导致 OOM。
- `ScheduledThreadPool` 和 `SingleThreadScheduledExecutor`:使用的无界的延迟阻塞队列`DelayedWorkQueue`，任务队列最大长度为 `Integer.MAX_VALUE`,可能堆积大量的请求，从而导致 OOM。

---

## 线程池参数最佳实践

先判断线程池要执行的任务类型

1. CPU 密集型任务
特点： 几乎不阻塞，主要消耗 CPU 资源
设计目标：**减少线程切换开销**，最大化 CPU 利用率
推荐配置：
```text
corePoolSize = CPU 核数
maximumPoolSize = CPU 核数 + 1
workQueue = 有界队列
```

2. IO 密集型任务
特点：大量阻塞（DB/RPC/HTTP等）
设计目标：**阻塞时仍能充分利用 CPU 资源**
```text
corePoolSize = CPU 核数 * 2 ~ CPU 核数 * 4
maximumPoolSize = 更大
workQueue = 有界队列
```

---
