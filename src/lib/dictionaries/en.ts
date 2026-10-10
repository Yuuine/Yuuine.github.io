/**
 * English.
 *
 * Post bodies stay Chinese for now — only the site chrome is translated,
 * and article pages carry a note saying so.
 */
export const en = {
  localeName: 'English',
  localeShort: 'EN',

  siteDescription: 'A tech blog on Java, distributed systems, DevOps, and AI engineering',
  tagline: 'Tech Notes',

  nav: {
    articles: 'Articles',
    projects: 'Projects',
    about: 'About',
  },

  header: {
    skip: 'Skip to content',
    navAria: 'Main navigation',
    home: 'Home',
    github: 'GitHub',
    theme: 'Switch between light and dark theme',
    language: 'Switch language',
  },

  footer: {
    navAria: 'Footer navigation',
    elsewhereAria: 'External links',
    navTitle: 'Navigation',
    elsewhereTitle: 'Elsewhere',
  },

  common: {
    minutes: (n: number) => `${n} min read`,
  },

  home: {
    eyebrow: 'Articles',
    recent: 'Recent posts',
    all: (n: number) => `All ${n} posts →`,
  },

  articles: {
    title: 'Articles',
    description:
      'Every note I have written: Java concurrency, distributed middleware, SQL, and AI engineering.',
  },

  /** The articles shell. nav labels the left rail, toggle is the button that folds it away */
  docs: {
    nav: 'Article navigation',
    toggle: 'Nav',
    all: 'All articles',
  },

  categories: {
    ai: 'AI',
    java: 'Java',
    devops: 'DevOps',
    sql: 'SQL',
    distributed: 'Distributed',
  } as Record<string, string>,

  category: {
    eyebrow: 'Category',
    description: (name: string, n: number) => `Every post filed under ${name} — ${n} in total.`,
  },

  projects: {
    eyebrow: 'Projects',
    title: 'Projects',
    description: 'Things I have built, with the technical choices and trade-offs behind them.',
    empty: 'No projects recorded yet.',
    live: 'Live site ↗',
    repo: 'Source ↗',
  },

  about: {
    eyebrow: 'About',
    title: 'About',
  },

  article: {
    toc: 'Contents',
    backToTop: 'Back to top',
    updated: 'Last updated',
    diagram: { zoomIn: 'Zoom in', zoomOut: 'Zoom out', reset: 'Reset to original size' },
    navAria: 'Previous and next post',
    prev: 'Previous',
    next: 'Next',
    related: 'Related posts',
    translationNotice: 'This post is currently only available in Chinese.',
  },

  notFound: {
    title: 'Page not found',
    heading: 'This page does not exist',
    lead: 'The link may be wrong, or this post has not been written yet.',
    home: 'Back home',
    articles: 'Read the posts',
  },
};
