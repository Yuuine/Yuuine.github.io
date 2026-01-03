---
title: MySQL 基础操作
date: 2025-08-04 21:45:37
categories: [ sql, mysql ]
tags: [ MySQL, database, sql ]
permalink: /sql/mysql_basic_operations/
---

# MySQL 基础操作

## SQL 规范书写说明
- SQL 关键字不区分大小写，但通常习惯使用大写书写关键字以提高可读性，例如 `SELECT`、`FROM`、`WHERE` 等。
- 表名和列名通常使用小写字母，并使用下划线分隔多个单词，例如 `user_info`。
- 每条 SQL 语句以分号 `;` 结尾。

为了保持语句的规范性，以下相关 SQL 语句均遵循以下规范书写：

- **SQL 关键字（SELECT, FROM, WHERE 等）一律大写**；
- **表名、字段名一律小写 + 下划线；字符串值保持自然大小写。**

## SQL 语言标准分类

- **DML**：数据操作语言，用于增删改数据。
- **DDL**：数据定义语言，用于创建、修改、删除数据库对象，如表、索引、视图等。
- **DCL**：数据控制语言，用于管理数据库的访问权限和安全。
- **TCL**：事务控制语言，用于管理数据库事务的边界和行为。

## 数据库相关操作

### 创建数据库

```sql
CREATE DATABASE 数据库名;
```

### 查看所有数据库

```sql
SHOW DATABASES;
 ```

### 切换数据库

```sql
USE 数据库名;
```
切换成功会在控制台提示 `Database changed`

### 删除数据库

```sql
DROP DATABASE 数据库名;
``` 
**注意：删除数据库会删除数据库中所有数据，无法恢复，谨慎操作**

删除数据库的时候可以带上 `IF EXISTS`，这样如何数据库不存在时就不会报错了。

```sql
DROP DATABASE IF EXISTS 数据库名;
```

## 表相关操作

### 查看所有的表

查看当前数据库的所有表
```sql
SHOW TABLES;
```

可以加 `FROM 数据库名` 来指定要查看的表
```sql
SHOW TABLES FROM 数据库名;
```

### 创建表

```sql
CREATE TABLE 表名(
    列名1 数据类型1,
    列名2 数据类型2,
    ...
    列名n 数据类型n
);
```
实际上创建表时通常会指定主键、索引、默认值等约束条件，例如：

```sql
CREATE TABLE IF NOT EXISTS 表名
(
    id         INT PRIMARY KEY AUTO_INCREMENT COMMENT '主键ID',
    name       VARCHAR(100) NOT NULL,
    age        INT       DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE = 数据库引擎
  DEFAULT CHARSET = 字符集
  COLLATE = 字符串比较合排序规则
  COMMENT = '表注释';
```

表创建时有很多选项可以配置，为了节省篇幅我就不一一列出，文章尾部会放一个比较全面的创建表示例。

### 查看表结构

```sql
desc 表名;
describe 表名;
explain 表名;
show columns from 表名;
show fields from 表名;
```
以上命令均可查看表结构，区别如下：

| 命令                     | 是否等价               | 标准性           | 推荐使用    | 说明           |
|------------------------|--------------------|---------------|---------|--------------|
| `DESC 表名`              | 等价于 `DESCRIBE`     | MySQL 特有      | 日常开发    | 最简洁          |
| `DESCRIBE 表名`          | 等价于 `DESC`         | MySQL 特有      | 日常开发    | 更正式          |
| `SHOW COLUMNS FROM 表名` | 功能等价               | MySQL 特有      | 脚本中可用   | 支持 `LIKE` 过滤 |
| `SHOW FIELDS FROM 表名`  | 等价于 `SHOW COLUMNS` | MySQL 特有      | **不推荐** | 仅为兼容旧习惯      |
| `EXPLAIN 表名`           | 等价于 `DESCRIBE`     | SQL 标准（但用法不同） | **不推荐** | 用于查询执行计划     |

> `EXPLAIN 表名` 主要用于分析 **SQL 语句查询的执行计划**，能返回表结构属于历史兼容写法，用于查询表结构属于非标准、不推荐的行为。

### 修改表

通常来说，创建表之前就要做好充分的设计，尽量增加一些冗余字段来应对未来的需求变更。

因为改动表的结构，就意味着对应的 SQL 语句要改、程序的逻辑代码要改、测试用例要改，很容易出现遗漏，导致程序出现意料之外的 bug。

#### 添加字段
```sql
ALTER TABLE 表名 ADD 列名 数据类型;
```

添加字段默认添加在表结构最后，如果希望添加在指定字段的前面，可以使用以下命令：
```sql
ALTER TABLE 表名 ADD 列名 数据类型 AFTER 指定列名;
```

#### 删除字段
```sql
ALTER TABLE 表名 DROP 列名;
 ```

#### 修改字段
```sql
ALTER TABLE 表名 MODIFY 列名 新数据类型;
 ```
> **注意：** 修改字段的数据类型时，出现数据类型不兼容会报错。

#### 修改字段名
```sql
ALTER TABLE 表名 CHANGE 旧列名 新列名 新数据类型;
 ```

#### 修改表名
```sql
ALTER TABLE 旧表名 RENAME TO 新表名;
 ```
> **注意：** 修改表名时，如果新表名已经存在，则会报错。


## 数据相关操作

### 增删改查

#### 插入数据

`INSERT INTO` 语句用于向表中插入新记录。
```sql
# 插入一行
INSERT INTO 表名
VALUES (10, 'root', 'root', 'xxxx@163.com');
# 插入多行
INSERT INTO 表名
VALUES 
  (10, 'root', 'root', 'xxxx@163.com'), 
  (12, 'user1', 'user1', 'xxxx@163.com'), 
  (18, 'user2', 'user2', 'xxxx@163.com');
```

插入行的一部分
```sql
INSERT INTO 表名(username, password, email)
VALUES ('admin', 'admin', 'xxxx@163.com');
```

插入查询出来的数据
```sql
INSERT INTO 表名(username)
SELECT name
FROM account;
```

#### 更新数据

`UPDATE` 语句用于修改表中的现有记录。
```sql
UPDATE 表名
SET username='robot', password='robot'
WHERE username = 'root';
```

#### 删除数据

`DELETE` 语句用于从表中删除现有记录。

删除表中的指定数据
```sql
DELETE FROM 表名
WHERE username = 'root';
```

清空表中的所有数据
```sql
TRUNCATE TABLE 表名;
```

#### 查询数据

`SELECT` 语句用于从表中检索数据。

查询单列
```sql
SELECT 列名 FROM 表名;
```

查询多列
```sql
SELECT 列名1, 列名2 FROM 表名;
```

查询所有列
```sql
SELECT * FROM 表名;
```

限定查询结果
```sql
SELECT * FROM 表名 LIMIT 10;
```
> 后面可以添加各种条件语句和限制条件，比如 `WHERE`、`ORDER BY`、`GROUP BY`、`HAVING`、`DISTINCT`、`LIMIT` 等。