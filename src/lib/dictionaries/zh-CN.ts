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
    title: '文章',
    description: '全部技术笔记：Java 并发、分布式中间件、SQL 与 AI 工程实践。',
  },

  /** 文章区外壳。nav 是左栏的无障碍名，toggle 是收起它那个按钮上的字 */
  docs: {
    nav: '文章导航',
    toggle: '导航',
    all: '全部文章',
  },

  /**
   * 分类的展示名。数据层是小写 slug（大小写不一致会让筛选对不上），
   * 展示时按语言取这里的名字，取不到就退回 slug。
   */
  categories: {
    ai: 'AI',
    java: 'Java',
    devops: 'DevOps',
    sql: 'SQL',
    distributed: '分布式',
  } as Record<string, string>,

  category: {
    eyebrow: 'Category',
    description: (name: string, n: number) => `${name} 分类下的全部文章，共 ${n} 篇。`,
  },

  projects: {
    eyebrow: 'Projects',
    title: '项目',
    description: '做过的项目与作品，包含技术选型、设计取舍和实现细节。',
    empty: '还没有录入项目。',
    live: '线上地址 ↗',
    repo: '源码 ↗',
  },

  about: {
    eyebrow: 'About',
    title: '关于我',
  },

  article: {
    toc: '目录',
    backToTop: '回到顶部',
    updated: '最后更新',
    diagram: { zoomIn: '放大', zoomOut: '缩小', reset: '恢复原始大小' },
    navAria: '上下篇',
    prev: '上一篇',
    next: '下一篇',
    related: '相关文章',
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
