---
title: synchronized 详解
categories: [ Java ]
date: 2025-07-10 18:47:28
description: '深入解析 Java synchronized 关键字的三种应用方式、底层原理及锁升级机制。'
tags: [ juc, synchronized ]
permalink: /juc/synchronized/
---

# synchronized 详解

## 简介

synchronized 是 Java 中最常用的锁，主要有三种应用方式：

> 同步方法，为当前对象（this）加锁，进入同步代码前要获得当前对象的锁；
> 同步静态方法，为当前类加锁（锁的是 Class 对象），进入同步代码前要获得当前类的锁；
> 同步代码块，指定加锁对象，对给定对象加锁，进入同步代码库前要获得给定对象的锁。

```java
// 关键字在实例方法上，锁为当前实例
public synchronized void instanceLock() {
    
}

// 关键字在静态方法上，锁为当前Class对象
public static synchronized void classLock() {
    
}

// 关键字在代码块上，锁为括号里面的对象
public void blockLock() {
    Object o = new Object();
    synchronized (o) {
        
    }
}
```

---

## 锁的四种状态

### 简介

`synchronized` 的锁升级机制是 JVM 为提升并发性能而设计的核心优化策略。它通过动态调整同步方式，在“无竞争”假设下实现近乎零开销，仅在必要时才付出重量级同步代价。

在 JDK 1.6 以前，所有的锁都是”重量级“锁，因为使用的是操作系统的互斥锁，当一个线程持有锁时，其他试图进入 `synchronized` 块的线程将被阻塞，直到锁被释放。涉及到了线程上下文切换和用户态与内核态的切换，因此效率较低。

为了减少获得锁和释放锁带来的性能消耗，JDK 1.6 引入了“偏向锁”和“轻量级锁” 的概念，对 `synchronized` 做了一次重大的升级

在 JDK 1.6 及其以后，一个对象有四种锁状态，它们级别由低到高依次是：

1. 无锁状态
2. 偏向锁状态 
3. 轻量级锁状态 
4. 重量级锁状态

一般情况下锁只能升级，不能降级。

不同锁状态对比：

| 状态   | 触发条件         | 核心机制                        | 性能   |
|------|--------------|-----------------------------|------|
| 无锁   | 初始状态         | Mark Word 存 hashCode        | 最佳   |
| 偏向锁  | 单线程首次进入      | Mark Word 存 threadId，后续直接通行 | 极低开销 |
| 轻量级锁 | 多线程交替访问（无并发） | CAS + Lock Record（栈上）       | 低开销  |
| 重量级锁 | 多线程真实竞争      | OS Mutex + Monitor          | 高开销  |

> 从 JDK 15 开始，已经不再推荐使用偏向锁。

下面先详细介绍不同锁状态的特点，再介绍锁升级机制。

---

### 无锁

无锁状态是最开始的状态，没有对资源进行锁定，任何线程都可以尝试对资源进行操作。

---

### 偏向锁

**偏向锁** 是 HotSpot 虚拟机对同步代码在**无竞争或极少竞争**场景下的一种优化策略，是最早期、最轻量级的一种优化手段。

它的核心思想是：
> 如果一个线程获得了锁，那么在接下来的一段时间内，如果该线程再次请求同一个锁，就不需要再进行任何同步操作（如 CAS、互斥等），直接认为它已经持有该锁。

换句话说：**偏向锁会“偏向”于第一个获取它的线程**，只要没有其他线程竞争，这个线程就永远不需要再进行同步。

示例：
```java
public class BiasedLockDemo {
    private final Object lock = new Object();

    public void doSomething() {
        synchronized (lock) {
            // 业务逻辑
        }
    }
}
```

- 如果只有一个线程调用 `doSomething()`，JVM 很可能对该 `lock` 对象启用偏向锁；
- 若多个线程交替调用，则偏向锁会被撤销，升级为轻量级锁甚至重量级锁。

---

### 轻量级锁

轻量级锁是 JVM 对 `synchronized` 关键字在低竞争、短时间持有锁场景下的一种优化机制，位于偏向锁之后、重量级锁之前。它是 HotSpot JVM 锁升级路径中的第二阶段。

虽然偏向锁适用于**单线程反复获取同一把锁**的场景，但一旦出现**多线程交替访问（无真正并发）** 的情况（例如线程 A 执行完释放锁，线程 B 立即获取），偏向锁就会被撤销，造成性能损耗。

此时，如果多个线程**不会同时竞争**（即没有真正的并发），而是**交替执行同步块**，那么使用操作系统级别的互斥量（重量级锁）就显得“杀鸡用牛刀”——因为重量级锁涉及内核态切换，开销大。

于是 JVM 引入了 **轻量级锁**：
> 在没有多线程**真正并发竞争**的情况下，通过 **CAS（Compare-And-Swap）** 操作和 **线程栈上的 Lock Record** 来实现快速加锁/解锁，避免进入操作系统内核。

**轻量级锁的局限性**

1. **自旋开销**：
    - 轻量级锁本身不包含自旋逻辑（自旋是在**膨胀为重量级锁前的尝试阶段**）；
    - 但如果多个线程**真正并发**，轻量级锁会迅速失败并升级为重量级锁。

2. **无法处理高竞争**：
    - 一旦检测到竞争（CAS 失败），JVM 会立即**膨胀（inflate）** 为重量级锁；
    - 膨胀后，所有后续操作都走 Monitor 机制。

示例：
```java
public class LightweightLockDemo {
    private final Object lock = new Object();

    public void method() {
        synchronized (lock) {
            // 短临界区
        }
    }

    public static void main(String[] args) throws InterruptedException {
        LightweightLockDemo demo = new LightweightLockDemo();
        
        Thread t1 = new Thread(demo::method);
        Thread t2 = new Thread(demo::method);
        
        t1.start();
        t2.start();
        
        t1.join();
        t2.join();
    }
}
```

- 如果 t1 和 t2 **几乎不重叠执行**（如 t1 执行完 t2 才开始），JVM 可能使用轻量级锁；
- 如果两者**高度并发**，则很快升级为重量级锁。

> 临界区：指的是某一块代码区域，它同一时刻只能由一个线程执行。

---

### 重量级锁

重量级锁 JVM 中 `synchronized` 关键字在**高并发竞争**场景下的最终实现形式，也是最“重”的一种锁机制。它直接依赖于操作系统的 **互斥量（Mutex）** 和 **线程调度**，因此被称为“重量级”。

当多个线程**真正并发地竞争同一把锁**时：

- 偏向锁已失效（被撤销）；
- 轻量级锁的 CAS 尝试失败（因为对象头已被其他线程修改）；

此时，继续使用自旋或轻量级机制会导致 CPU 资源浪费（忙等待），JVM 会将锁 **膨胀（inflate）** 为重量级锁，让操作系统介入管理线程的阻塞与唤醒。

> 核心思想：**用线程挂起/唤醒代替 CPU 自旋，节省资源**。

在 JVM 中，重量级锁的实现基于 **Monitor（监视器）** 对象，也称为 **ObjectMonitor**。

---

## 锁升级机制

在 64 位 JVM 中，每个 Java 对象都有一个 **对象头（Object Header）**，其中最关键的部分是 **Mark Word（标记字段）**，占 8 字节（64 位）。

### Mark Word 布局（随锁状态变化）

| 锁状态       | Mark Word 内容（64 位）         |
|-----------|----------------------------|
| **无锁**    | `unused:25                 | hashCode:31 | unused:1 | age:4 | biased_lock:0 | lock:01`                     |
| **偏向锁**   | `thread:54                 | epoch:2 | unused:1 | age:4 | biased_lock:1 | lock:01`                      |
| **轻量级锁**  | `pointer_to_lock_record:62 | lock:00`                                                  |
| **重量级锁**  | `pointer_to_monitor:62     | lock:10`                                                      |
| **GC 标记** | `lock:11`                  |

> - `biased_lock`：是否开启偏向（0=未开启，1=已开启）
> - `lock`：锁状态（01=无锁/偏向，00=轻量，10=重量，11=GC）

JVM 通过**复用这 64 位**，在不同状态下存储不同信息，实现“零额外内存开销”的锁管理。

---

### 1. **无锁状态（Normal / Unlocked）**
- **初始状态**：对象刚创建，未进入任何 synchronized 块。
- **Mark Word**：存储对象的 `hashCode`（若未调用 `hashCode()`，可被覆盖用于锁）。
- **特点**：完全无同步开销。

> 注意：一旦调用 `obj.hashCode()`，JVM 会**永久禁用该对象的偏向锁**（因为 hashCode 需要稳定存储）。

---

### 2. **偏向锁（Biased Locking）**

#### 触发条件
- JVM 启动后 **4 秒**（默认延迟，可通过 `-XX:BiasedLockingStartupDelay=0` 关闭）
- 对象未被哈希（未调用 `hashCode()`）
- 未发生 GC 移动（G1/CMS 可能影响）
- 第一个线程首次进入 synchronized 块

#### 工作原理
1. 线程 A 首次进入 `synchronized(obj)`。
2. JVM 检查对象是否可偏向（`biased_lock=0` 且无 hashcode）。
3. 执行 **CAS**，将 Mark Word 替换为：
    - `threadId = A`
    - `epoch`（用于批量撤销）
    - `biased_lock = 1`
4. 后续 A 再次进入：**直接比对 threadId，匹配则通行**（无 CAS、无阻塞）。

#### 撤销（Revoke）
当线程 B 尝试获取同一对象的锁：
- JVM 暂停线程 A（SafePoint）
- 检查 A 是否仍在 synchronized 块内：
    - 若已退出 → 直接撤销偏向，回到 **无锁**
    - 若仍在执行 → 升级为 **轻量级锁**

---

### 3. **轻量级锁（Lightweight Locking）**

#### 触发条件
- 偏向锁被撤销后，有多个线程**交替访问**（无真正并发）
- 或直接在无偏向环境下多线程竞争

#### 工作原理
1. 线程 A 进入 synchronized：
    - 在**自己栈帧**中创建 **Lock Record**
    - **CAS 将对象 Mark Word 替换为指向 Lock Record 的指针**
    - Mark Word 最低位设为 `00`
2. 线程 B 尝试进入：
    - 发现 Mark Word 已被占用（指向 A 的 Lock Record）
    - **自旋若干次**（默认 10 次，由 `_spin` 参数控制）
    - 若 A 已退出（恢复 Mark Word），B 成功 CAS 获取
    - 若自旋失败 → 升级为 **重量级锁**

---

### 4. **重量级锁（Heavyweight / Inflated）**

#### 触发条件
- 轻量级锁自旋失败
- 多线程**真实并发竞争**
- 或直接高并发场景

#### 工作原理
1. JVM 为对象分配一个 **Monitor 对象**
2. Mark Word 指向 Monitor 地址，最低两位设为 `10`
3. Monitor 结构：
    - `_owner`：当前持有线程
    - `_EntryList`：阻塞队列（BLOCKED 状态）
    - `_WaitSet`：wait() 等待集合
4. 竞争线程进入 `_EntryList`，调用 OS 的 `mutex.lock()` 挂起
5. 释放锁时，唤醒 `_EntryList` 中一个线程（**非公平**）

---

{% mermaid %}
graph TD
A[对象创建 无锁] --> B{是否启用偏向锁}
    B -->|是| C[偏向锁 线程A]
    B -->|否| D[轻量级锁 线程A CAS]
    C -->|线程B 进入| E[检查偏向持有线程]
    E -->|线程A 已退出| F[撤销偏向]
    E -->|线程A 仍执行| G[升级轻量级锁]
    F --> D
    G --> H[线程B 自旋 CAS]
    H -->|成功| I[线程B 持有轻量级锁]
    H -->|失败 超过阈值| J[升级重量级锁]
    D -->|多线程竞争| J
    J --> K[Monitor 队列 阻塞唤醒]
{% endmermaid %}

> - **升级不可逆**：一旦变为重量级锁，不会降级（除非对象被回收）
> - **升级是单向性能妥协**：从“零开销” → “用户态自旋” → “内核态阻塞”

---

