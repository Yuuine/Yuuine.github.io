---
title: SQL 常用语句
date: 2025-08-03 21:59:26
categories: [ sql, mysql ]
tags: [ MySQL, database, sql ]
permalink: /sql/commonly_used_sql_statements/
---

# SQL 常用语句

## 分组

**`group by`**：

- `group by` 子句将记录分组到汇总行中。
- `group by` 为每个组返回一个记录。
- `group by` 通常还涉及聚合`count`，`max`，`sum`，`avg` 等。
- `group by` 可以按一列或多列进行分组。
- `group by` 按分组字段进行排序后，`order by` 可以以汇总字段来进行排序。

**分组**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name;
```

**分组后排序**

```sql
SELECT cust_name, COUNT(cust_address) AS addr_num
FROM Customers GROUP BY cust_name
ORDER BY cust_name DESC;
```

**`having`**：

- `having` 用于对汇总的 `group by` 结果进行过滤。
- `having` 一般都是和 `group by` 连用。
- `where` 和 `having` 可以在相同的查询中。

**使用 WHERE 和 HAVING 过滤数据**

```sql
SELECT cust_name, COUNT(*) AS NumberOfOrders
FROM Customers
WHERE cust_email IS NOT NULL
GROUP BY cust_name
HAVING COUNT(*) > 1;
```

**`having` vs `where`**：

- `where`：过滤过滤指定的行，后面不能加聚合函数（分组函数）。`where` 在`group by` 前。
- `having`：过滤分组，一般都是和 `group by` 连用，不能单独使用。`having` 在 `group by` 之后。

## 子查询

子查询是嵌套在较大查询中的 SQL 查询，也称内部查询或内部选择，包含子查询的语句也称为外部查询或外部选择。简单来说，子查询就是指将一个 `select` 查询（子查询）的结果作为另一个 SQL 语句（主查询）的数据来源或者判断条件。

子查询可以嵌入 `SELECT`、`INSERT`、`UPDATE` 和 `DELETE` 语句中，也可以和 `=`、`<`、`>`、`IN`、`BETWEEN`、`EXISTS` 等运算符一起使用。

子查询常用在 `WHERE` 子句和 `FROM` 子句后边：

- 当用于 `WHERE` 子句时，根据不同的运算符，子查询可以返回单行单列、多行单列、单行多列数据。子查询就是要返回能够作为 `WHERE` 子句查询条件的值。
- 当用于 `FROM` 子句时，一般返回多行多列数据，相当于返回一张临时表，这样才符合 `FROM` 后面是表的规则。这种做法能够实现多表联合查询。

> 注意：MYSQL 数据库从 4.1 版本才开始支持子查询，早期版本是不支持的。

用于 `WHERE` 子句的子查询的基本语法如下：

```sql
select column_name [, column_name ]
from   table1 [, table2 ]
where  column_name operator
    (select column_name [, column_name ]
    from table1 [, table2 ]
    [where])
```

- 子查询需要放在括号`( )`内。
- `operator` 表示用于 where 子句的运算符。

用于 `FROM` 子句的子查询的基本语法如下：

```sql
select column_name [, column_name ]
from (select column_name [, column_name ]
      from table1 [, table2 ]
      [where]) as temp_table_name
where  condition
```

用于 `FROM` 的子查询返回的结果相当于一张临时表，所以需要使用 AS 关键字为该临时表起一个名字。

**子查询的子查询**

```sql
SELECT cust_name, cust_contact
FROM customers
WHERE cust_id IN (SELECT cust_id
                  FROM orders
                  WHERE order_num IN (SELECT order_num
                                      FROM orderitems
                                      WHERE prod_id = 'RGAN01'));
```
内部查询首先在其父查询之前执行，以便可以将内部查询的结果传递给外部查询。

### WHERE

- `WHERE` 子句用于过滤记录，即缩小访问数据的范围。
- `WHERE` 后跟一个返回 `true` 或 `false` 的条件。
- `WHERE` 可以与 `SELECT`，`UPDATE` 和 `DELETE` 一起使用。
- 可以在 `WHERE` 子句中使用的操作符。

| 运算符  | 描述                                                   |
| ------- | ------------------------------------------------------ |
| =       | 等于                                                   |
| <>      | 不等于。注释：在 SQL 的一些版本中，该操作符可被写成 != |
| >       | 大于                                                   |
| <       | 小于                                                   |
| >=      | 大于等于                                               |
| <=      | 小于等于                                               |
| BETWEEN | 在某个范围内                                           |
| LIKE    | 搜索某种模式                                           |
| IN      | 指定针对某个列的多个可能值                             |

**`SELECT` 语句中的 `WHERE` 子句**

```ini
SELECT * FROM Customers
WHERE cust_name = 'Kids Place';
```

**`UPDATE` 语句中的 `WHERE` 子句**

```ini
UPDATE Customers
SET cust_name = 'Jack Jones'
WHERE cust_name = 'Kids Place';
```

**`DELETE` 语句中的 `WHERE` 子句**

```ini
DELETE FROM Customers
WHERE cust_name = 'Kids Place';
```

### IN 和 BETWEEN

- `IN` 操作符在 `WHERE` 子句中使用，作用是在指定的几个特定值中任选一个值。
- `BETWEEN` 操作符在 `WHERE` 子句中使用，作用是选取介于某个范围内的值。

**IN 示例**

```sql
SELECT *
FROM products
WHERE vend_id IN ('DLL01', 'BRS01');
```

**BETWEEN 示例**

```sql
SELECT *
FROM products
WHERE prod_price BETWEEN 3 AND 5;
```

### AND、OR、NOT

- `AND`、`OR`、`NOT` 是用于对过滤条件的逻辑处理指令。
- `AND` 优先级高于 `OR`，为了明确处理顺序，可以使用 `()`。
- `AND` 操作符表示左右条件都要满足。
- `OR` 操作符表示左右条件满足任意一个即可。
- `NOT` 操作符用于否定一个条件。

**AND 示例**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' AND prod_price <= 4;
```

**OR 示例**

```ini
SELECT prod_id, prod_name, prod_price
FROM products
WHERE vend_id = 'DLL01' OR vend_id = 'BRS01';
```

**NOT 示例**

```sql
SELECT *
FROM products
WHERE prod_price NOT BETWEEN 3 AND 5;
```

### LIKE

- `LIKE` 操作符在 `WHERE` 子句中使用，作用是确定字符串是否匹配模式。
- 只有字段是文本值时才使用 `LIKE`。
- `LIKE` 支持两个通配符匹配选项：`%` 和 `_`。
- 不要滥用通配符，通配符位于开头处匹配会非常慢。
- `%` 表示任何字符出现任意次数。
- `_` 表示任何字符出现一次。

**% 示例**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '%bean bag%';
```

**_ 示例**

```sql
SELECT prod_id, prod_name, prod_price
FROM products
WHERE prod_name LIKE '__ inch teddy bear';
```

## 连接

JOIN 是“连接”的意思，顾名思义，SQL JOIN 子句用于将两个或者多个表联合起来进行查询。

连接表时需要在每个表中选择一个字段，并对这些字段的值进行比较，值相同的两条记录将合并为一条。**连接表的本质就是将不同表的记录合并起来，形成一张新表。当然，这张新表只是临时的，它仅存在于本次查询期间**。

使用 `JOIN` 连接两个表的基本语法如下：

```sql
select table1.column1, table2.column2...
from table1
join table2
on table1.common_column1 = table2.common_column2;
```

`table1.common_column1 = table2.common_column2` 是连接条件，只有满足此条件的记录才会合并为一行。您可以使用多个运算符来连接表，例如 =、>、<、<>、<=、>=、!=、`between`、`like` 或者 `not`，但是最常见的是使用 =。

当两个表中有同名的字段时，为了帮助数据库引擎区分是哪个表的字段，在书写同名字段名时需要加上表名。当然，如果书写的字段名在两个表中是唯一的，也可以不使用以上格式，只写字段名即可。

另外，如果两张表的关联字段名相同，也可以使用 `USING`子句来代替 `ON`，举个例子：

```sql
# join....on
select c.cust_name, o.order_num
from Customers c
inner join Orders o
on c.cust_id = o.cust_id
order by c.cust_name;

# 如果两张表的关联字段名相同，也可以使用USING子句：join....using()
select c.cust_name, o.order_num
from Customers c
inner join Orders o
using(cust_id)
order by c.cust_name;
```

**`ON` 和 `WHERE` 的区别**：

- 连接表时，SQL 会根据连接条件生成一张新的临时表。`ON` 就是连接条件，它决定临时表的生成。
- `WHERE` 是在临时表生成以后，再对临时表中的数据进行过滤，生成最终的结果集，这个时候已经没有 JOIN-ON 了。

所以总结来说就是：**SQL 先根据 ON 生成一张临时表，然后再根据 WHERE 对临时表进行筛选**。

SQL 允许在 `JOIN` 左边加上一些修饰性的关键词，从而形成不同类型的连接，如下表所示：

| 连接类型                                 | 说明                                                |
|--------------------------------------|---------------------------------------------------|
| INNER JOIN 内连接                       | （默认连接方式）只有当两个表都存在满足条件的记录时才会返回行。                   |
| LEFT JOIN / LEFT OUTER JOIN 左(外)连接   | 返回左表中的所有行，即使右表中没有满足条件的行也是如此。                      |
| RIGHT JOIN / RIGHT OUTER JOIN 右(外)连接 | 返回右表中的所有行，即使左表中没有满足条件的行也是如此。                      |
| FULL JOIN / FULL OUTER JOIN 全(外)连接   | 只要其中有一个表存在满足条件的记录，就返回行。                           |
| SELF JOIN                            | 将一个表连接到自身，就像该表是两个表一样。为了区分两个表，在 SQL 语句中需要至少重命名一个表。 |
| CROSS JOIN                           | 交叉连接，从两个或者多个连接表中返回记录集的笛卡尔积。                       

如果不加任何修饰词，只写 `JOIN`，那么默认为 `INNER JOIN`

对于 `INNER JOIN` 来说，还有一种隐式的写法，称为 “**隐式内连接**”，也就是没有 `INNER JOIN` 关键字，使用 `WHERE` 语句实现内连接的功能

```sql
# 隐式内连接
select c.cust_name, o.order_num
from Customers c, Orders o
where c.cust_id = o.cust_id
order by c.cust_name;

# 显式内连接
select c.cust_name, o.order_num
from Customers c inner join Orders o
using(cust_id)
order by c.cust_name;
```

## 组合

`UNION` 运算符将两个或更多查询的结果组合起来，并生成一个结果集，其中包含来自 `UNION` 中参与查询的提取行。

`UNION` 基本规则：

- 所有查询的列数和列顺序必须相同。
- 每个查询中涉及表的列的数据类型必须相同或兼容。
- 通常返回的列名取自第一个查询。

默认地，`UNION` 操作符选取不同的值。如果允许重复的值，请使用 `UNION ALL`。

```sql
SELECT column_name(s) FROM table1
UNION ALL
SELECT column_name(s) FROM table2;
```

`UNION` 结果集中的列名总是等于 `UNION` 中第一个 `SELECT` 语句中的列名。

`JOIN` vs `UNION`：

- `JOIN` 中连接表的列可能不同，但在 `UNION` 中，所有查询的列数和列顺序必须相同。
- `UNION` 将查询之后的行放在一起（垂直放置），但 `JOIN` 将查询之后的列放在一起（水平放置），即它构成一个笛卡尔积。

## 函数

不同数据库的函数往往各不相同，因此不可移植。本节主要以 MySQL 的函数为例。

### 文本处理

| 函数                  | 说明          |
|---------------------|-------------|
| `LEFT()`、`RIGHT()`  | 左边或者右边的字符   |
| `LOWER()`、`UPPER()` | 转换为小写或者大写   |
| `LTRIM()`、`RTRIM()` | 去除左边或者右边的空格 |
| `LENGTH()`          | 长度，以字节为单位   |
| `SOUNDEX()`         | 转换为语音值      |

其中， **`SOUNDEX()`** 可以将一个字符串转换为描述其语音表示的字母数字模式。

```sql
SELECT *
FROM mytable
WHERE SOUNDEX(col1) = SOUNDEX('apple')
```

### 日期和时间处理

- 日期格式：`YYYY-MM-DD`
- 时间格式：`HH:MM:SS`

| 函 数             | 说 明             |
|-----------------|-----------------|
| `AddDate()`     | 增加一个日期（天、周等）    |
| `AddTime()`     | 增加一个时间（时、分等）    |
| `CurDate()`     | 返回当前日期          |
| `CurTime()`     | 返回当前时间          |
| `Date()`        | 返回日期时间的日期部分     |
| `DateDiff()`    | 计算两个日期之差        |
| `Date_Add()`    | 高度灵活的日期运算函数     |
| `Date_Format()` | 返回一个格式化的日期或时间串  |
| `Day()`         | 返回一个日期的天数部分     |
| `DayOfWeek()`   | 对于一个日期，返回对应的星期几 |
| `Hour()`        | 返回一个时间的小时部分     |
| `Minute()`      | 返回一个时间的分钟部分     |
| `Month()`       | 返回一个日期的月份部分     |
| `Now()`         | 返回当前日期和时间       |
| `Second()`      | 返回一个时间的秒部分      |
| `Time()`        | 返回一个日期时间的时间部分   |
| `Year()`        | 返回一个日期的年份部分     |

### 数值处理

| 函数     | 说明  |
|--------|-----|
| SIN()  | 正弦  |
| COS()  | 余弦  |
| TAN()  | 正切  |
| ABS()  | 绝对值 |
| SQRT() | 平方根 |
| MOD()  | 余数  |
| EXP()  | 指数  |
| PI()   | 圆周率 |
| RAND() | 随机数 |

### 汇总

| 函 数       | 说 明      |
|-----------|----------|
| `AVG()`   | 返回某列的平均值 |
| `COUNT()` | 返回某列的行数  |
| `MAX()`   | 返回某列的最大值 |
| `MIN()`   | 返回某列的最小值 |
| `SUM()`   | 返回某列值之和  |

`AVG()` 会忽略 NULL 行。

使用 `DISTINCT` 可以让汇总函数值汇总不同的值。

```sql
SELECT AVG(DISTINCT col1) AS avg_col
FROM mytable
```

### 约束

SQL 约束用于规定表中的数据规则。

如果存在违反约束的数据行为，行为会被约束终止。

约束可以在创建表时规定（通过 CREATE TABLE 语句），或者在表创建之后规定（通过 ALTER TABLE 语句）。

约束类型：

- `NOT NULL` - 指示某列不能存储 NULL 值。
- `UNIQUE` - 保证某列的每行必须有唯一的值。
- `PRIMARY KEY` - NOT NULL 和 UNIQUE 的结合。确保某列（或两个列多个列的结合）有唯一标识，有助于更容易更快速地找到表中的一个特定的记录。
- `FOREIGN KEY` - 保证一个表中的数据匹配另一个表中的值的参照完整性。
- `CHECK` - 保证列中的值符合指定的条件。
- `DEFAULT` - 规定没有给列赋值时的默认值。

创建表时使用约束条件：

```sql
CREATE TABLE Users (
  Id INT(10) UNSIGNED NOT NULL AUTO_INCREMENT COMMENT '自增Id',
  Username VARCHAR(64) NOT NULL UNIQUE DEFAULT 'default' COMMENT '用户名',
  Password VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '密码',
  Email VARCHAR(64) NOT NULL DEFAULT 'default' COMMENT '邮箱地址',
  Enabled TINYINT(4) DEFAULT NULL COMMENT '是否有效',
  PRIMARY KEY (Id)
) ENGINE=InnoDB 
  AUTO_INCREMENT=2
  DEFAULT
  CHARSET=utf8mb4
  COMMENT='用户表';
```

## 事务处理

不能回退 `SELECT` 语句，回退 `SELECT` 语句也没意义；也不能回退 `CREATE` 和 `DROP` 语句。

**MySQL 默认是隐式提交**，每执行一条语句就把这条语句当成一个事务然后进行提交。当出现 `START TRANSACTION` 语句时，会关闭隐式提交；当 `COMMIT` 或 `ROLLBACK` 语句执行后，事务会自动关闭，重新恢复隐式提交。

通过 `set autocommit=0` 可以取消自动提交，直到 `set autocommit=1` 才会提交；`autocommit` 标记是针对每个连接而不是针对服务器的。

指令：

- `START TRANSACTION` - 指令用于标记事务的起始点。
- `SAVEPOINT` - 指令用于创建保留点。
- `ROLLBACK TO` - 指令用于回滚到指定的保留点；如果没有设置保留点，则回退到 `START TRANSACTION` 语句处。
- `COMMIT` - 提交事务。

```sql
-- 开始事务
START TRANSACTION;

-- 插入操作 A
INSERT INTO `user`
VALUES (1, 'root1', 'root1', 'xxxx@163.com');

-- 创建保留点 updateA
SAVEPOINT updateA;

-- 插入操作 B
INSERT INTO `user`
VALUES (2, 'root2', 'root2', 'xxxx@163.com');

-- 回滚到保留点 updateA
ROLLBACK TO updateA;

-- 提交事务，只有操作 A 生效
COMMIT;
```