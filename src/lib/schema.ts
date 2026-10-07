import type { ArticleMeta } from './articles';
import { DEFAULT_LOCALE } from './i18n';
import { SITE, absoluteUrl } from './site';

/**
 * JSON-LD 结构化数据。
 *
 * 页面上的标题、时间、作者对人是一目了然的，对机器只是一堆文本 ——
 * 这里把它们写成 schema.org 的断言，搜索引擎不必去猜哪块是正文、谁写的、什么时候改过。
 */

function personSchema() {
  return {
    '@type': 'Person',
    name: SITE.author,
    url: SITE.url,
    sameAs: [SITE.github],
  };
}

export function webSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.title,
    url: SITE.url,
    inLanguage: DEFAULT_LOCALE,
    author: personSchema(),
  };
}

export function blogPostingSchema(article: ArticleMeta) {
  // canonical 一律指向中文原文，非中文的那两份只是同一内容的副本
  const url = absoluteUrl(article.permalink);

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.description,
    url,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    datePublished: new Date(article.date).toISOString(),
    dateModified: new Date(article.updated).toISOString(),
    inLanguage: DEFAULT_LOCALE,
    author: personSchema(),
    keywords: article.tags.join(', '),
    articleSection: article.categories.join(', '),
  };
}
