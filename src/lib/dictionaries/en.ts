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
    meta: 'Next.js · Custom theme',
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
    eyebrow: 'Articles',
    title: 'Articles',
    description:
      'Every note I have written: Java concurrency, distributed middleware, SQL, and AI engineering.',
    lead: (n: number) => `${n} posts, newest first. These are things I actually ran into.`,
    filterAria: 'Categories',
    filterAll: (n: number) => `All ${n}`,
  },

  projects: {
    eyebrow: 'Projects',
    title: 'Projects',
    description: 'Things I have built, with the technical choices and trade-offs behind them.',
    lead: 'Things I have built, and why I picked what I picked. The data lives in src/data/projects.ts — add an entry and one more shows up here.',
    empty: 'No projects recorded yet.',
    live: 'Live site ↗',
    repo: 'Source ↗',
  },

  about: {
    eyebrow: 'About',
    title: 'About',
    description:
      'About Yuuine — a Java backend developer working on concurrency, distributed systems, and AI engineering.',
    lead: 'I am Yuuine. I write Java, and a bit of frontend. This site is my notebook — somewhere to write down what I have figured out, and an excuse to fiddle with design.',
    doingTitle: 'What I work on',
    doingBody:
      'Backend, mostly: concurrency, the JVM, MySQL, distributed middleware. Over the past two years a large share of my time has gone to AI engineering — RAG retrieval pipelines, the MCP protocol, and its tooling ecosystem. The categories here map roughly onto that range: Java, distributed systems, SQL, and AI.',
    siteTitle: 'This site',
    siteBody1:
      'Started in 2024 on Hexo with the Ayer theme. Rebuilt from scratch in 2026: moved to Next.js and wrote the design system and theme by hand, because fighting someone else’s theme gets old fast.',
    siteBody2:
      'It is a static export deployed on GitHub Pages behind Cloudflare. Code highlighting is Shiki with dual themes, math goes through KaTeX, and all 19 older posts kept their original URLs.',
    expTitle: 'Experience',
    expNote:
      'Work history goes here — companies, roles, dates, the systems you owned. Two or three lines each. What you did and what came of it is enough; no need to write a résumé.',
    skillsTitle: 'Skills',
    skillsNote:
      'The stack you are happy to be hired for. Two tiers — comfortable, and have used — reads better than one flat list.',
    contactTitle: 'Contact',
    contactNote:
      'Email or another way to reach you. Delete this paragraph entirely if you would rather not publish an address.',
    placeholderTag: 'TODO',
  },

  article: {
    navAria: 'Previous and next post',
    prev: 'Previous',
    next: 'Next',
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
