# 旧站 URL 中转

旧站（Hexo）与新站的文章 URL **完全一致** —— 19 篇的 `permalink` 迁移时原样保留，
所以这里要处理的只有**列表页**：分类、标签、归档。

不处理的话它们是硬 404。GitHub Pages 是纯静态托管，做不了 301，所以中转落在 Cloudflare 层
（域名本来就托管在 Cloudflare）。

## 映射表（35 条）

分类指向新站的分类真路由；标签与列表页统一回文章列表 —— 标签页不做页面，
25 个标签平均每个不到 1 篇，是典型的薄内容。

| 旧 URL | 新 URL |
|---|---|
| `/categories/AI/` | `/category/ai/` |
| `/categories/DevOps/` | `/category/devops/` |
| `/categories/Distributed/` | `/category/distributed/` |
| `/categories/Java/` | `/category/java/` |
| `/categories/SQL/` | `/category/sql/` |
| `/categories/sql/` | `/category/sql/` |
| `/categories/distributed/` | `/category/distributed/` |
| `/categories/` | `/articles/` |

后两条小写的是旧站导航里写错的形式（导航指向 `/categories/sql`，实际目录是 `SQL`）——
**旧站自己就 404**，这里一并接住。

标签页 25 条与 `/tags/`、`/archives/`，全部 → `/articles/`：

```
claude-code  ai  cli  collection  docker  linux  ci-cd  springboot
elasticsearch  search  juc  lock  synchronized  thread-pool  langchain4j
rag  java  llm  mcp  agent  mysql  network  javaweb  openclaw  containerization
```

## 怎么应用

### 方案 A：Cloudflare Worker（推荐）

一条脚本覆盖全部 35 条，不受规则条数限制，也不用逐条在后台点。

Cloudflare 后台 → Workers & Pages → 新建 Worker → 粘贴下面这段 → 部署 →
在域名的 Routes 里挂 `www.yuuine.cn/*`。

```js
const CATEGORY = {
  AI: 'ai', DevOps: 'devops', Distributed: 'distributed', Java: 'java', SQL: 'sql',
  ai: 'ai', devops: 'devops', distributed: 'distributed', java: 'java', sql: 'sql',
};

const TAG_PAGE = /^\/tags\/([^/]+)\/?$/;
const LISTING = new Set(['/tags/', '/tags', '/categories/', '/categories', '/archives/', '/archives']);

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname;

    const category = path.match(/^\/categories\/([^/]+)\/?$/);
    if (category && CATEGORY[category[1]]) {
      return Response.redirect(`${url.origin}/category/${CATEGORY[category[1]]}/`, 301);
    }

    if (TAG_PAGE.test(path) || LISTING.has(path)) {
      return Response.redirect(`${url.origin}/articles/`, 301);
    }

    return fetch(request);
  },
};
```

### 方案 B：Cloudflare Bulk Redirects

后台 → Rules → Bulk Redirects，按上表逐条录入或上传列表。
好处是不写代码；**代价是要先确认免费额度够不够 35 条**（以后台当前显示为准，我没有核实过）。

### 方案 C：不做

接受这些 URL 404。它们会落到设计过的 404 页面（有页头页脚、样式正常），
但外部链接带来的权重会丢掉。

## 验证

上线后跑一遍，全部应返回 `301`：

```bash
for u in categories/AI categories/SQL tags/llm tags/ archives tags categories; do
  printf '%-24s %s\n' "$u" "$(curl -s -o /dev/null -w '%{http_code} -> %{redirect_url}' "https://www.yuuine.cn/$u/")"
done
```

## 为什么不是静态中转页

在仓库里生成 35 个 `<meta http-equiv="refresh">` 页面也能"跳过去"，但：

- Google 把 meta-refresh 当作 **soft redirect**，权重传递明显弱于真 301
- 这些页面本身会被收录，等于给站点添 35 个空页面
- GitHub Pages 的 `404.html` 是兜底，不能按路径分流

所以只在完全无法碰 Cloudflare 时才考虑它。
