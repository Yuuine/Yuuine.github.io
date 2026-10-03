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
app/  ──▶  views/  ──▶  components/  ──▶  lib/  ──▶  content/
```

| 层 | 允许 | 禁止 |
|---|---|---|
| `app/` | 定义路由、导出 metadata、按语言渲染 view | 内联业务逻辑、直接读文件系统 |
| `views/` | 取数据、拼页面、接收 `locale`；`views/<页面>/` 放该页私有模块 | 引用 `app/`、被别的页面引用 |
| `components/` | 接收 props 渲染 | 取数据、读文件 |
| `lib/` | 纯函数、读 `content/`、字典 | 引用 `components/`、返回 JSX |
| `content/` | Markdown 与结构化数据 | — |

**页面私有模块放 `views/<页面>/`**，不进 `components/`。首页的设计密度和其它页不是一个量级，
把它的组件、几何、动效混进共享层，共享层会被首页专属代码撑肿 —— 而它们本该是全站共用的。
目前只有 `views/home/` 一个。

### 样式

| 层 | 文件 | 职责 |
|---|---|---|
| L1 | `tokens.css` | 设计令牌。换肤只需改 `--hue-1st` / `--hue-2nd` |
| L2 | `base.css` | reset + 排版 + `.prose` |
| L3 | `components.css` | 全站共用的组件 |
| L4 | `pages/home.css`、`pages/inner.css` | 页面专属。首页自己一份，其余页面共用一份 |

颜色只能从 L1 的令牌取，L2–L4 禁止出现硬编码色值。

### 首页动效

按"它是什么"分，不集中在一个文件里：

| 文件 | 职责 |
|---|---|
| `views/home/wordmark-geometry.ts` | 字标的静态几何（纯数据，不含时序） |
| `views/home/Wordmark.tsx` | 字标渲染，纯服务端组件 |
| `views/home/CodeMosaic.tsx` | 马赛克墙的静态渲染，服务端组件 —— 198 块砖和那 56 条代码片段都不进客户端包 |
| `views/home/mosaic-shuffle.ts` | 华容道换块：空格游走、砖块滑动、何时停 |
| `views/home/MosaicShuffle.tsx` | 上面那套的客户端叶子（`'use client'` 下沉到叶子） |

两条踩过的硬约束：

- **动画属性要能进合成器。** `offset-path`、`stroke-dashoffset`、带 `linear()` 缓动的动画实测都在主线程逐帧重画
  （分别 138 / 64 / 64 ms/s）；换成等弧长采样的 `transform` 关键帧后是 2.3ms/s。几十毫秒每秒就是肉眼可见的掉帧来源。
- **滚出视口必须停。** 首页会停在下面读文章，一面看不见的墙不该继续跑。马赛克换块由 `IntersectionObserver` 控制启停，
  实测可见时约 12ms/s、滚走后 2.5ms/s（后者是页面地板值）。

## 路由与 URL 契约

| 路由 | 实现 |
|---|---|
| 中文（根路径） | `app/(zh)/**`，路由组不产生 URL 段 |
| `/en/**`、`/zh-TW/**` | `app/[lang]/**`，`generateStaticParams` 只返回这两种语言 |
| 19 条文章路径 | `app/**/[...slug]/page.tsx` + `generateStaticParams` + `dynamicParams = false` |
| `/atom.xml`、`/sitemap.xml`、`/robots.txt` | 约定文件，静态导出下必须声明 `force-static` |

**中文留在根路径是为了 URL 不迁移** —— 静态导出做不了重定向，一旦给中文加前缀就没有退路。代价是路由分成两支，而 Next 只允许 root layout 渲染 `<html>`，所以 `(zh)/layout.tsx` 与 `[lang]/layout.tsx` 各是一个 root layout：`<html>/<body>` 在 `components/RootShell.tsx`，站点外壳（全局样式、主题脚本、页头、页脚、`<main>`）在 `components/SiteChrome.tsx`。

外壳单独拆出来是为了 404：`out/404.html` 由 `app/not-found.tsx` 生成，而它落在两个 root layout 之外，拿不到 `<html>` 也拿不到全局样式。所以 404 页的 `<html lang>` 是空的 —— 这是两个 root layout 架构的固有代价，`<html>` 只能由 root layout 渲染。

**URL 由 front-matter 的 `permalink` 决定，与文件名无关。** 改文件名不影响线上地址，改 `permalink` 会让旧链接失效。

`dynamicParams = false` 是刻意的：不在列表内的路径直接 404，避免 catch-all 吞掉未定义路径。

## 多语言

界面文案三语，文章正文目前只有中文。

| 关注点 | 做法 |
|---|---|
| 字典 | `lib/dictionaries/{zh-CN,zh-TW,en}.ts`，类型由简中推导，漏字段构建期报错 |
| 取词 | `getDictionary(locale)`，组件接收 `locale` 或文案 props |
| 路径 | 一律写「默认语言下的路径」，渲染时过 `localeHref(locale, path)` |
| 未翻译内容 | `buildMetadata({ translated: false })`：canonical 收敛回中文原文且不发 hreflang |
| 切换器 | `LanguageSwitcher` 基座是 `<details>`（原生开合、无 JS 可用、标签留在 DOM 里），只补了原生缺的点外部关闭与 Esc 关闭；href 由 `usePathname()` 剥掉当前语言前缀得到，在文章页也能停在原篇 |

---

其余文档：[README](../README.md)（跑起来 / 写内容 / 部署）、[CLAUDE.md](../CLAUDE.md)（开发约定与工作准则）。
