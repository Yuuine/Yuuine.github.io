/** 繁體中文。用词按台湾习惯（專案／介面／匯出／資料），不做逐字转写。 */
export const zhTW = {
  localeName: '繁體中文',
  localeShort: '繁體',

  siteDescription: '技術部落格，分享 Java、分散式、DevOps、AI 等領域的知識與實踐',
  tagline: '技術筆記',

  nav: {
    articles: '文章',
    projects: '專案',
    about: '關於',
  },

  header: {
    skip: '跳到主要內容',
    navAria: '主要導覽',
    home: '首頁',
    github: 'GitHub',
    theme: '切換淺色 / 深色主題',
    language: '切換語言',
  },

  footer: {
    navAria: '頁尾導覽',
    elsewhereAria: '外部連結',
    navTitle: '導覽',
    elsewhereTitle: '在其他地方',
  },

  common: {
    minutes: (n: number) => `${n} 分鐘`,
  },

  home: {
    eyebrow: 'Articles',
    recent: '最近寫的',
    all: (n: number) => `全部 ${n} 篇 →`,
  },

  articles: {
    eyebrow: 'Articles',
    title: '文章',
    description: '全部技術筆記：Java 並行、分散式中介軟體、SQL 與 AI 工程實踐。',
    lead: (n: number) => `共 ${n} 篇。依時間倒序，寫的是我實際踩過的坑。`,
    filterAria: '分類',
    filterAll: (n: number) => `全部 ${n}`,
  },

  categories: {
    ai: 'AI',
    java: 'Java',
    devops: 'DevOps',
    sql: 'SQL',
    distributed: '分散式',
  } as Record<string, string>,

  category: {
    eyebrow: 'Category',
    all: '全部文章',
    lead: (n: number) => `共 ${n} 篇。`,
    description: (name: string, n: number) => `${name} 分類下的全部文章，共 ${n} 篇。`,
  },

  projects: {
    eyebrow: 'Projects',
    title: '專案',
    description: '做過的專案與作品，包含技術選型、設計取捨與實作細節。',
    empty: '尚未新增專案。',
    live: '線上網址 ↗',
    repo: '原始碼 ↗',
  },

  about: {
    eyebrow: 'About',
    title: '關於我',
  },

  article: {
    toc: '目錄',
    backToTop: '回到頂部',
    updated: '最後更新',
    diagram: { zoomIn: '放大', zoomOut: '縮小', reset: '恢復原始大小' },
    navAria: '上下篇',
    prev: '上一篇',
    next: '下一篇',
    related: '相關文章',
    translationNotice: '這篇文章目前只有簡體中文版。',
  },

  notFound: {
    title: '頁面不存在',
    heading: '這個頁面不存在',
    lead: '可能是連結寫錯了，或者這篇文章還沒寫。',
    home: '回首頁',
    articles: '看文章',
  },
};
