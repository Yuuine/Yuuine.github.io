# Yuuine

个人站。文章、项目、关于三块，Next.js 静态导出，部署在 GitHub Pages。

---

## 四条命令

```bash
npm run dev       # 开发 → http://localhost:3000
npm run build     # 构建 → 产物在 out/
npm run preview   # 预览构建产物（发布前用这个检查）
npm run lint      # 代码检查
```

**`dev` 和 `preview` 的区别**：`dev` 是即时编译、带热更新，写东西时用；`preview` 服务的是真实的 `out/` 产物，性能和行为跟线上完全一致。改完样式想确认最终效果，必须跑 `preview`。

> ⚠️ **不要用 `npm start`**。项目配了 `output: 'export'`（静态导出），`next start` 会直接报错：
> `"next start" does not work with "output: export" configuration.`
> 静态导出没有服务端，预览产物用 `npm run preview`。

端口默认 3000，被占用会自动往后找一个，具体端口在启动日志里。

---

## 内容怎么写

### 文章

在 `src/content/articles/` 下新建一个 `.md` 文件，开头写 front-matter：

```yaml
---
title: 文章标题
date: 2026-09-30 14:30:00
description: 一句话摘要，会用在列表卡片、搜索结果和 RSS 里
categories: [ ai ]
tags: [ mcp, llm ]
permalink: /ai/mcp/example/
math: false
---

正文用标准 Markdown。支持 GFM（表格、任务列表、删除线）、
代码高亮（Shiki，明暗双主题）、以及 $$公式$$（把 math 设为 true）。
```

| 字段 | 必填 | 说明 |
|---|---|---|
| `title` | ✅ | 文章标题 |
| `date` | ✅ | 按**东八区**解析，写 `2026-09-30 14:30:00` 就行 |
| `description` | ✅ | 摘要，用于列表卡片 + 社交分享 + RSS |
| `categories` | ✅ | 数组，**统一小写** |
| `tags` | ✅ | 数组，**统一小写** |
| `permalink` | ✅ | **决定 URL**，必须以 `/` 开头和结尾 |
| `math` | — | 正文含公式时设 `true`，否则不加载 KaTeX 样式 |

**两个容易踩的点：**

1. **URL 由 `permalink` 决定，不是文件名。** 文件叫什么都不影响线上地址。改名随便，改 `permalink` 会让旧链接失效。
2. **`categories` 和 `tags` 一定要小写。** 大小写不一致会导致分类筛选对不上（旧站就吃过这个亏：菜单指向 `/categories/sql`，实际目录是 `SQL`，线上 404）。

写完跑一次 `npm run build`，如果 front-matter 写错了（比如漏了 `title`），构建会直接失败并告诉你哪一篇有问题。

### 项目

编辑 `src/data/projects.ts`，往数组里加一条：

```ts
{
  name: '项目名',
  summary: '一句话说明它解决什么问题',
  detail: '背景、你负责的部分、有什么取舍',   // 可选
  stack: ['Java', 'Spring Boot', 'MySQL'],
  repo: 'https://github.com/Yuuine/xxx',      // 可选
  link: 'https://example.com',                // 可选
  year: '2025',
  featured: true,                             // 可选，置顶
}
```

文件里保留了一段注释掉的模板，照着填即可。

### 关于页

编辑 `src/app/about/page.tsx`。页面里有几处 `<Placeholder>` 标记的段落是需要填真实内容的地方，**填完把 `<Placeholder>` 换成普通的 `<p>`**，否则页面上会一直显示「待填」标签。

---

## 部署说明

推到 `main` 分支即自动部署，不需要手动操作。

```
git push origin main
   ↓
GitHub Actions「Pages」workflow
   checkout → Node 22 → npm ci → npm run build → 上传 out/
   ↓
GitHub Pages 托管（自定义域 www.yuuine.cn）
   ↓
Cloudflare 反代 + 缓存
```

**workflow 文件**：`.github/workflows/pages.yml`，只在 `main` 分支的 push 触发。重构分支（`refactor/*`）推上去不会影响线上。

### 两个必需的产物文件

它们放在 `public/`，构建时会被拷到 `out/` 根目录：

| 文件 | 作用 |
|---|---|
| `public/.nojekyll` | **必需**。GitHub Pages 默认会跑 Jekyll 处理，而 Jekyll 会忽略 `_` 开头的目录——正好把 Next 的 `_next/`（全部 CSS 和 JS）吃掉。这个空文件用来关闭 Jekyll |
| `public/CNAME` | 自定义域名 `www.yuuine.cn` |

删掉 `.nojekyll` 的后果是线上页面**样式和脚本全部 404**，页面变成裸 HTML。

### 本地验证部署产物

推送前建议先在本地确认产物是完整的：

```bash
npm run build
npm run preview
```

然后访问 http://localhost:3000，检查首页、文章页、`/sitemap.xml`、`/atom.xml` 是否都正常。

### 域名与 DNS

域名的解析和 HTTPS 由 **Cloudflare** 托管，不在这套 CI 里。换服务器或换平台时才需要动 DNS，日常发文章不用管。

---

## 遇到问题

**`npm run dev` 端口不是 3000** —— 说明 3000 被占用了，看启动日志里实际用的端口。

**构建报 front-matter 错误** —— 报错信息会指出是哪一篇的哪个字段，照着改。

**线上样式丢失、控制台一堆 `_next/...` 404** —— `public/.nojekyll` 没了，补回来重新部署。
