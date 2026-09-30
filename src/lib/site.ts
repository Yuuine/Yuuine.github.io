import type { Dictionary } from './i18n';

/**
 * 站点级常量。所有绝对 URL（canonical / og:url / sitemap / RSS）统一从这里推导，
 * 保证站内不存在第二处域名定义。
 *
 * 面向访客的文案（站点描述、导航名）不在这里 —— 它们随语言变化，放在 lib/dictionaries。
 */
export const SITE = {
  url: 'https://www.yuuine.cn',
  title: 'Yuuine',
  author: 'Yuuine',
  keywords: ['blog', '技术博客', 'Java', '分布式', 'DevOps', 'AI', 'LLM', 'MCP'],
  github: 'https://github.com/Yuuine',
} as const;

type NavKey = keyof Dictionary['nav'];

/**
 * 导航结构。path 一律写「默认语言下的路径」，渲染时由 localeHref 按当前语言加前缀 ——
 * 新增板块只需要在这里加一项，外加三份字典里的标签。
 */
export const NAV: ReadonlyArray<{ key: NavKey; path: string }> = [
  { key: 'articles', path: '/articles/' },
  { key: 'projects', path: '/projects/' },
  { key: 'about', path: '/about/' },
];

/** 拼绝对 URL，避免出现 "https://host" + "path" 少斜杠的问题 */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE.url).toString();
}
