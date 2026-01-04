---
title: MySQL 日志详解
date: 2025-08-09 17:34:50
categories: [ sql, mysql ]
tags: [ MySQL, database, sql ]
permalink: /sql/mysql_log/
---

# MySQL 日志详解

## 前言

MySQL 日志 主要包括错误日志、一般查询日志、慢查询日志、事务日志、二进制日志、回滚日志几大类。

其中，比较重要是属二进制日志 binlog 和重做日志 redo log 和回滚日志 undo log。

主要作用：
1. **错误日志（Error Log）**：记录 MySQL 启动、运行和停止过程中发生的错误信息，帮助诊断问题。

2. **一般查询日志（General Query Log）**：记录 MySQL 服务器的启动关闭信息，客户端的连接信息，以及更新、查询的 SQL 语句等。

3. **慢查询日志（Slow Query Log）**：记录执⾏时间超过 long_query_time 值的所有 SQL 语句。这个时间值是可配置的，默认情况下，慢查询日志功能是关闭的。

4. **重做日志（Redo Log）**：记录对于 InnoDB 表的每个写操作，不是 SQL 级别的，而是物理级别的，主要用于崩溃恢复。

5. **二进制日志（Binary Log，binlog）**：记录所有修改数据库状态的 SQL 语句，以及每个语句的执行时间，如 INSERT、UPDATE、DELETE 等，但不包括 SELECT 和 SHOW 这类的操作。

6. **回滚日志（Undo Log）**：记录数据被修改之前的值，用于事务的回滚。

**下面重点说三大日志：重做日志 redo log、二进制日志 binlog、回滚日志 undo log。**

---

## 重做日志（Redo Log）

redo log（重做日志）是 InnoDB 存储引擎独有的，让 MySQL 拥有了崩溃恢复能力。

比如 MySQL 实例挂了或宕机了，重启时，InnoDB 存储引擎会使用 redo log 恢复数据，保证数据的持久性与完整性。

MySQL 中数据是以页为单位，查询一条记录，会从硬盘把这条记录的这一页数据加载出来，加载出来的数据叫数据页，会放入到 `Buffer Pool` 中。

后续的查询都是先从 `Buffer Pool` 中找，没有命中再去硬盘加载，减少硬盘 IO 开销，提升性能。

更新表数据的时候，也是如此，发现 `Buffer Pool` 里存在要更新的数据，就直接在 `Buffer Pool` 里更新。

然后会把“在某个数据页上做了什么修改”记录到重做日志缓存（`redo log buffer`）里，接着刷盘到 redo log 文件里。

理想情况，事务一提交就会进行刷盘操作，但实际上，刷盘的时机是根据策略来进行的。

> 每条 redo 记录由“表空间号+数据页号+偏移量+修改数据长度+具体修改的数据”组成

**工作流程：**

```text
事务修改数据
    ↓
数据先写入 Buffer Pool（内存）
    ↓
同时生成 Redo Log（prepare 状态）
    ↓
事务提交 → Redo Log 写盘并标记 commit
    ↓
后台线程异步刷脏页到磁盘
```

### 刷盘机制

在 InnoDB 存储引擎中，**redo log buffer**（重做日志缓冲区）是一块用于暂存 redo log 的内存区域。为了确保事务的持久性和数据的一致性，InnoDB 会在特定时机将这块缓冲区中的日志数据刷新到磁盘上的 redo log 文件中。这些时机可以归纳为以下六种：

1. **事务提交时（最核心）**：当事务提交时，log buffer 里的 redo log 会被刷新到磁盘（可以通过`innodb_flush_log_at_trx_commit`参数控制，后文会提到）。
2. **redo log buffer 空间不足时**：这是 InnoDB 的一种主动容量管理策略，旨在避免因缓冲区写满而导致用户线程阻塞。
    - 当 redo log buffer 的已用空间超过其总容量的**一半 (50%)** 时，后台线程会**主动**将这部分日志刷新到磁盘，为后续的日志写入腾出空间，这是一种“未雨绸缪”的优化。
    - 如果因为大事务或 I/O 繁忙导致 buffer 被**完全写满**，那么所有试图写入新日志的用户线程都会被**阻塞**，并强制进行一次同步刷盘，直到有可用空间为止。这种情况会影响数据库性能，应尽量避免。
3. **触发检查点 (Checkpoint) 时**：Checkpoint 是 InnoDB 为了缩短崩溃恢复时间而设计的核心机制。当 Checkpoint 被触发时，InnoDB 需要将在此检查点之前的所有脏页刷写到磁盘。根据 **Write-Ahead Logging (WAL)** 原则，数据页写入磁盘前，其对应的 redo log 必须先落盘。因此，执行 Checkpoint 操作必然会确保相关的 redo log 也已经被刷新到了磁盘。
4. **后台线程周期性刷新**：InnoDB 有一个后台的 master thread，它会大约每秒执行一次例行任务，其中就包括将 redo log buffer 中的日志刷新到磁盘。这个机制是 `innodb_flush_log_at_trx_commit` 设置为 0 或 2 时的主要持久化保障。
5. **正常关闭服务器**：在 MySQL 服务器正常关闭的过程中，为了确保所有已提交事务的数据都被完整保存，InnoDB 会执行一次最终的刷盘操作，将 redo log buffer 中剩余的全部日志都清空并写入磁盘文件。
6. **binlog 切换时**：当开启 binlog 后，在 MySQL 采用 `innodb_flush_log_at_trx_commit=1` 和 `sync_binlog=1` 的 双一配置下，为了保证 redo log 和 binlog 之间状态的一致性（用于崩溃恢复或主从复制），在 binlog 文件写满或者手动执行 flush logs 进行切换时，会触发 redo log 的刷盘动作。

总之，InnoDB 在多种情况下会刷新重做日志，以保证数据的持久性和一致性。

我们要注意设置正确的刷盘策略`innodb_flush_log_at_trx_commit` 。根据 MySQL 配置的刷盘策略的不同，MySQL 宕机之后可能会存在轻微的数据丢失问题。

`innodb_flush_log_at_trx_commit` 的值有 3 种，也就是共有 3 种刷盘策略：

- **0**：设置为 0 的时候，表示每次事务提交时不进行刷盘操作。这种方式性能最高，但是也最不安全，因为如果 MySQL 挂了或宕机了，可能会丢失最近 1 秒内的事务。
- **1**：设置为 1 的时候，表示每次事务提交时都将进行刷盘操作。这种方式性能最低，但是也最安全，因为只要事务提交成功，redo log 记录就一定在磁盘里，不会有任何数据丢失。
- **2**：设置为 2 的时候，表示每次事务提交时都只把 log buffer 里的 redo log 内容写入 page cache（文件系统缓存）。page cache 是专门用来缓存文件的，这里被缓存的文件就是 redo log 文件。这种方式的性能和安全性都介于前两者中间。

刷盘策略`innodb_flush_log_at_trx_commit` 的默认值为 1，设置为 1 的时候才不会丢失任何数据。为了保证事务的持久性，我们必须将其设置为 1。

另外，InnoDB 存储引擎有一个后台线程，每隔`1` 秒，就会把 `redo log buffer` 中的内容写到文件系统缓存（`page cache`），然后调用 `fsync` 刷盘。

也就是说，一个没有提交事务的 redo log 记录，也可能会刷盘。

**为什么呢？**

因为在事务执行过程 redo log 记录是会写入`redo log buffer` 中，这些 redo log 记录会被后台线程刷盘。

除了后台线程每秒`1`次的轮询操作，还有一种情况，当 `redo log buffer` 占用的空间即将达到 `innodb_log_buffer_size` 一半的时候，后台线程会主动刷盘。

**innodb_flush_log_at_trx_commit=0**

为`0`时，如果 MySQL 挂了或宕机可能会有`1`秒数据的丢失。

**innodb_flush_log_at_trx_commit=1**

为`1`时， 只要事务提交成功，redo log 记录就一定在硬盘里，不会有任何数据丢失。

如果事务执行期间 MySQL 挂了或宕机，这部分日志丢了，但是事务并没有提交，所以日志丢了也不会有损失。

**innodb_flush_log_at_trx_commit=2**

为`2`时， 只要事务提交成功，`redo log buffer`中的内容只写入文件系统缓存（`page cache`）。

如果仅仅只是 MySQL 挂了不会有任何数据丢失，但是宕机可能会有`1`秒数据的丢失。

总结：
- 0：定期刷盘（性能最好）

- 1：每次提交都刷盘（最安全）

- 2：每次提交写入 page cache（性能和安全性介于前两者中间）

---

**为什么不在修改数据后直接刷盘，而是需要 redo log ？**

数据页大小是`16KB`，刷盘是随机写，刷盘比较耗时，如果就修改了数据页里的几 `Byte` 数据，把完整的数据页刷盘很浪费性能。

如果是写 redo log，一行记录可能就占几十 `Byte`，只包含表空间号、数据页号、磁盘文件偏移
量、更新值，再加上是顺序写，所以刷盘速度很快。

所以用 redo log 形式记录修改内容，性能远远超过刷数据页的方式，让数据库的并发能力更强。

---

## 二进制日志（Binary Log）

binlog 是逻辑日志，记录内容是语句的原始逻辑，包括原始的 SQL 语句或者行数据变化，例如“将 id=2 这行数据的 age 字段 +1”，属于 `MySQL Server` 层，与存储引擎⽆关。

### 记录格式

binlog 日志有三种格式，可以通过`binlog_format`参数指定。

- **statement**
- **row**
- **mixed**

指定`statement`，记录的内容是`SQL`语句原文，比如执行一条`update T set update_time=now() where id=1`。

同步数据时，会执行记录的`SQL`语句，但是有个问题，`update_time=now()`这里会获取当前系统时间，直接执行会导致与原库的数据不一致。

为了解决这种问题，我们需要指定为`row`，记录的内容不再是简单的`SQL`语句了，还包含操作的具体数据。

`row`格式记录的内容看不到详细信息，要通过`mysqlbinlog`工具解析出来。

`update_time=now()`变成了具体的时间`update_time=1627112756247`，条件后面的@1、@2、@3 都是该行数据第 1 个~3 个字段的原始值（**假设这张表只有 3 个字段**）。

这样就能保证同步数据的一致性，通常情况下都是指定为`row`，这样可以为数据库的恢复与同步带来更好的可靠性。

但是这种格式，需要更大的容量来记录，比较占用空间，恢复与同步时会更消耗 IO 资源，影响执行速度。

所以就有了一种折中的方案，指定为`mixed`，记录的内容是前两者的混合。

MySQL 会判断这条`SQL`语句是否可能引起数据不一致，如果是，就用`row`格式，否则就用`statement`格式。

### 写入机制

binlog 的写入时机也非常简单，事务执行过程中，先把日志写到`binlog cache`，事务提交的时候，再把`binlog cache`写到 binlog 文件中。

因为一个事务的 binlog 不能被拆开，无论这个事务多大，也要确保一次性写入，所以系统会给每个线程分配一个块内存作为`binlog cache`。

我们可以通过`binlog_cache_size`参数控制单个线程 binlog cache 大小，如果存储内容超过了这个参数，就要暂存到磁盘（`Swap`）。

### 刷盘流程

Binlog 在事务提交阶段，由 Server 层统一写入 binlog cache，并在提交时根据配置刷盘，从而保证事务的持久性和主从复制的一致性。

```text
事务执行 SQL
   ↓
生成 Binlog Event
   ↓
写入 Binlog Cache（内存）
   ↓
事务进入提交阶段
   ↓
根据 sync_binlog 决定是否刷盘
   ↓
事务提交完成
```

**写入 Binlog Cache（内存）**

* 每个事务都有一个 **binlog cache**
* SQL 执行过程中不断生成 binlog event
* 此阶段 **不涉及磁盘 IO**

**事务提交时写 Binlog 文件**

* 提交阶段：

    * 将 binlog cache 内容写入 **binlog 文件**

**Binlog 刷盘（fsync）**

由参数 **`sync_binlog`** 控制：

| sync_binlog 值 | 行为            | 风险         |
|---------------|---------------|------------|
| 0             | 由 OS 决定刷盘     | 可能丢 binlog |
| 1             | 每次事务提交都 fsync | 最安全        |
| N             | 每 N 次提交 fsync | 性能与安全折中    |

**只有 binlog 写成功（并刷盘）后，事务才算提交成功**，这是两阶段提交中的 **第二阶段**。

### 两阶段提交（2PC）

MySQL 的两阶段提交是为了保证 **Redo Log（InnoDB）和 Binlog（Server 层）的一致性**，在事务提交时将提交过程拆分为 **prepare 阶段** 和 **commit 阶段**。

如果没有 2PC，可能出现：

* 数据写成功但 binlog 丢失 → 主从不一致
* binlog 写成功但数据未提交 → 主从“多数据”

**为什么需要两阶段提交？**

**Redo Log 和 Binlog 属于不同层**：

| 日志       | 所属层            |
|----------|----------------|
| Redo Log | InnoDB 引擎      |
| Binlog   | MySQL Server 层 |

事务提交需要 **跨组件原子性**，必须保证：

* 要么 **两者都成功**
* 要么 **两者都失败**

两阶段提交流程：
```text
1. 执行事务 SQL
2. 修改 Buffer Pool
3. 写 Undo Log（用于回滚 / MVCC）

------ 第一阶段（Prepare）------
4. 写 Redo Log（prepare 状态）并刷盘

------ 第二阶段（Commit）-------
5. 写 Binlog（并根据 sync_binlog 决定是否刷盘）
6. 写 Redo Log（commit 状态）
7. 事务提交完成
```

---

## 回滚日志 （Undo Log）

`undo log` 是一种用于撤销回退的日志。

在事务没提交之前， MySQL 会先记录更新前的数据到 undo log 日志文件里面，当事务回滚时或者数据库崩溃时，可以利用 undo log 来进行回退。

`undo log` 主要有两个作用：

### 一、回滚操作（实现事务的原子性）

我们在进行数据更新操作的时候，不仅会记录redo log，还会记录undo log，如果因为某些原因导致事务回滚，那么这个时候MySQL就要执行回滚（rollback）操作，利用undo log 将数据恢复到事务开始之前的状态。

如我们执行下面一条删除语句：
```sql
delete from user where id = 1;
```

那么此时 undo log 会记录一条对应的 insert 语句**反向操作的语句**，以保证在事务回滚时，将数据还原回去。
```sql
insert into user (id, 字段1, 字段2, ...) values (1, 原始值1, 原始值2, ...);
```

如我们执行一条update语句：
```sql
update user set name = "李四" where id = 1;   ---修改之前name=张三
```

此时undo log会记录一条相反的update语句，如下：
```sql
update user set name = "张三" where id = 1;
```

如果这个修改出现异常，可以使用 undo log 日志来实现回滚操作，以保证事务的一致性。

### 二、提供 MVCC（多版本并发控制）

在 MySQL 的 InnoDB 存储引擎中，**多版本并发控制（MVCC）是通过 Undo Log 实现的**。

Undo Log 负责保存数据行在被修改前的历史版本，从而使不同事务在同一时间点可以看到不同版本的数据。

当事务对一行记录执行 `UPDATE` 或 `DELETE` 操作时，InnoDB 并不会直接覆盖旧数据，而是：

1. 将**修改前的行数据**写入 Undo Log
2. 在当前行记录中保存：

    * 当前事务的 `trx_id`
    * 指向 Undo Log 的 `roll_pointer`
3. 新旧版本通过 `roll_pointer` 串联成一条**版本链**

这样，一行记录在逻辑上就同时存在多个版本。

在执行快照读（普通 `SELECT`）时：

1. InnoDB 为事务创建一个 **Read View**
2. 当读取某行记录时：

    * 如果当前版本对事务可见，直接返回
    * 如果不可见，则沿着 `roll_pointer` 指向的 Undo Log 版本链向前查找
3. 找到**第一个对当前事务可见的历史版本**并返回

整个过程不加锁、不阻塞写操作，并保证事务隔离性。

### tips：快照读和当前读

**快照读（Snapshot Read）**

读写不冲突，每次读取的是快照数据。

- 隔离级别 Repeatable Read 下（默认隔离级别）：有可能读取的不是最新的数据。
- Read Committed 隔离级别下：快照读和当前读读取的数据是一样的，都是最新的。

* 基于 Undo Log + Read View
* 读取历史可见版本
* 不加锁
* 普通 `SELECT` 即快照读

**当前读（Current Read）**

每次读取的都是当前最新的数据，但是读的时候不允许写，写的时候也不允许读。

* 直接读取最新版本
* 通过行锁 / 间隙锁保证一致性
* `UPDATE`、`DELETE`、`SELECT ... FOR UPDATE` 等

> 当前读不会使用 Undo Log 回溯历史版本，而是对最新数据加锁后读取。

**Undo Log 生命周期**

* Undo Log 在事务提交后**不会立即删除**，仍需为其他事务提供历史版本，在由 InnoDB 的 **Purge 线程** 在确认无事务引用后清理。