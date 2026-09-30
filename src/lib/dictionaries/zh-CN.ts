/**
 * 简体中文 —— 字典的源语言，也是 `Dictionary` 类型的来源。
 * 新增字段先写在这里，另外两份会因类型不匹配在构建期报错。
 */
export const zhCN = {
  localeName: '简体中文',
  localeShort: '简体',

  siteDescription: '技术博客，分享 Java、分布式、DevOps、AI 等领域的知识与实践',
  tagline: '技术笔记',

  nav: {
    articles: '文章',
    projects: '项目',
    about: '关于',
  },

  header: {
    skip: '跳到正文',
    navAria: '主导航',
    home: '首页',
    github: 'GitHub',
    theme: '切换浅色 / 深色主题',
    language: '切换语言',
  },

  footer: {
    navAria: '页脚导航',
    elsewhereAria: '外部链接',
    navTitle: '导航',
    elsewhereTitle: '在别处',
    meta: 'Next.js · 自建主题',
  },

  common: {
    minutes: (n: number) => `${n} 分钟`,
  },

  home: {
    eyebrow: 'Articles',
    recent: '最近写的',
    all: (n: number) => `全部 ${n} 篇 →`,
  },

  articles: {
    eyebrow: 'Articles',
    title: '文章',
    description: '全部技术笔记：Java 并发、分布式中间件、SQL 与 AI 工程实践。',
    lead: (n: number) => `共 ${n} 篇。按时间倒序，写的是我实际踩过的东西。`,
    filterAria: '分类',
    filterAll: (n: number) => `全部 ${n}`,
  },

  projects: {
    eyebrow: 'Projects',
    title: '项目',
    description: '做过的项目与作品，包含技术选型、设计取舍和实现细节。',
    lead: '做过的东西，以及当时为什么这么选。数据在 src/data/projects.ts，加一条就多一个。',
    empty: '还没有录入项目。',
    live: '线上地址 ↗',
    repo: '源码 ↗',
  },

  about: {
    eyebrow: 'About',
    title: '关于我',
    description: '关于 Yuuine —— Java 后端方向的开发者，关注并发、分布式与 AI 工程。',
    lead: '我是 Yuuine，写 Java，也写点前端。这个站是我的笔记本 —— 把弄明白的东西写下来，顺便当成一个可以随便折腾设计的地方。',
    doingTitle: '在做什么',
    doingBody:
      '后端方向，日常和并发、JVM、MySQL、分布式中间件打交道。最近两年很大一部分精力在 AI 工程上：RAG 的检索链路、MCP 协议与工具生态。这个站的文章分类基本就是这个范围的映射 —— Java、分布式、SQL、AI。',
    siteTitle: '这个站',
    siteBody1:
      '2024 年建的，最初是 Hexo + Ayer 主题。2026 年做了一次彻底重构：换到 Next.js，设计系统和主题从零自己写，因为套用现成主题改到后面会一直在跟主题搏斗。',
    siteBody2:
      '技术上是静态导出，部署在 GitHub Pages，前面挂 Cloudflare。代码高亮用 Shiki 双主题，公式走 KaTeX，19 篇历史文章保留了原来的 URL。',
    expTitle: '经历',
    expNote:
      '这里放你的工作经历 —— 公司、职位、时间段、负责的系统。两三行一段，写清楚「做了什么」和「结果是什么」就够了，不用写成简历。',
    skillsTitle: '技能',
    skillsNote: '这里放你愿意被认领的技术栈，建议按「熟练 / 用过」两档分，别全列成一样。',
    contactTitle: '联系',
    contactNote: '邮箱或其他联系方式。不想公开邮箱的话这一段直接删掉。',
    placeholderTag: '待填',
  },

  article: {
    navAria: '上下篇',
    prev: '上一篇',
    next: '下一篇',
    translationNotice: '',
  },

  notFound: {
    title: '页面不存在',
    heading: '这个页面不存在',
    lead: '可能是链接写错了，或者这篇文章还没写。',
    home: '回首页',
    articles: '看文章',
  },
};
