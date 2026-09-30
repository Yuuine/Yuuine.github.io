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
    meta: 'Next.js · 自建主題',
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

  projects: {
    eyebrow: 'Projects',
    title: '專案',
    description: '做過的專案與作品，包含技術選型、設計取捨與實作細節。',
    lead: '做過的東西，以及當時為什麼這樣選。資料在 src/data/projects.ts，加一筆就多一個。',
    empty: '尚未新增專案。',
    live: '線上網址 ↗',
    repo: '原始碼 ↗',
  },

  about: {
    eyebrow: 'About',
    title: '關於我',
    description: '關於 Yuuine —— Java 後端方向的開發者，關注並行、分散式與 AI 工程。',
    lead: '我是 Yuuine，寫 Java，也寫點前端。這個站是我的筆記本 —— 把弄懂的東西寫下來，順便當成一個可以隨便折騰設計的地方。',
    doingTitle: '在做什麼',
    doingBody:
      '後端方向，日常和並行、JVM、MySQL、分散式中介軟體打交道。最近兩年很大一部分精力放在 AI 工程上：RAG 的檢索鏈路、MCP 協定與工具生態。這個站的文章分類基本上就是這個範圍的映射 —— Java、分散式、SQL、AI。',
    siteTitle: '這個站',
    siteBody1:
      '2024 年建的，最初是 Hexo + Ayer 主題。2026 年做了一次徹底重構：換到 Next.js，設計系統與主題從零自己寫，因為套用現成主題改到後面會一直在跟主題搏鬥。',
    siteBody2:
      '技術上是靜態匯出，部署在 GitHub Pages，前面掛 Cloudflare。程式碼高亮用 Shiki 雙主題，公式走 KaTeX，19 篇歷史文章保留了原本的 URL。',
    expTitle: '經歷',
    expNote:
      '這裡放你的工作經歷 —— 公司、職位、時間段、負責的系統。兩三行一段，寫清楚「做了什麼」和「結果是什麼」就夠了，不用寫成履歷。',
    skillsTitle: '技能',
    skillsNote: '這裡放你願意被認領的技術棧，建議按「熟練 / 用過」兩檔分，別全列成一樣。',
    contactTitle: '聯絡',
    contactNote: '電子郵件或其他聯絡方式。不想公開信箱的話這一段直接刪掉。',
    placeholderTag: '待補',
  },

  article: {
    navAria: '上下篇',
    prev: '上一篇',
    next: '下一篇',
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
