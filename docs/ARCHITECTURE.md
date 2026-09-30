# 架构

Yuuine 个人站，包含文章、项目、关于三块。

核心特征：**构建期把 Markdown 渲染成静态 HTML，纯静态托管，运行期没有服务端、数据库和 API。**

![Yuuine 个人站架构](architecture-diagram.svg)

> 可交互版本（缩放 / 明暗切换 / 路径高亮）：[architecture-diagram.html](architecture-diagram.html)
> 图源码：[architecture-diagram.json](architecture-diagram.json)

---

## 分层

两条分层规则，都是**单向依赖**，都禁止反向引用。

### 代码

```
app/  ──▶  components/  ──▶  lib/  ──▶  content/
```

| 层 | 允许 | 禁止 |
|---|---|---|
| `app/` | 取数据、拼页面、定义 metadata | 内联业务逻辑、直接读文件系统 |
| `components/` | 接收 props 渲染 | 取数据、读文件 |
| `lib/` | 纯函数、读 `content/` | 引用 `components/`、返回 JSX |
| `content/` | Markdown 与结构化数据 | — |

### 样式

| 层 | 文件 | 职责 |
|---|---|---|
| L1 | `tokens.css` | 设计令牌。换肤只需改 `--hue-1st` / `--hue-2nd` |
| L2 | `base.css` | reset + 排版 + `.prose` |
| L3 | `components.css` | 组件 |
| L4 | `pages.css` | 页面专属 |

颜色只能从 L1 的令牌取，L2–L4 禁止出现硬编码色值。

## 路由与 URL 契约

| 路由 | 实现 |
|---|---|
| `/`、`/articles/`、`/projects/`、`/about/` | 静态页，`app/<name>/page.tsx` |
| 19 条文章路径 | `app/[...slug]/page.tsx` + `generateStaticParams` + `dynamicParams = false` |
| `/atom.xml`、`/sitemap.xml`、`/robots.txt` | 约定文件，静态导出下必须声明 `force-static` |

**URL 由 front-matter 的 `permalink` 决定，与文件名无关。** 改文件名不影响线上地址，改 `permalink` 会让旧链接失效。

`dynamicParams = false` 是刻意的：不在列表内的路径直接 404，避免 catch-all 吞掉未定义路径。

---

其余文档：[README](../README.md)（跑起来 / 写内容 / 部署）、[CLAUDE.md](../CLAUDE.md)（开发约定与工作准则）。
