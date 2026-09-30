/**
 * 站点级常量。所有绝对 URL（canonical / og:url / sitemap / RSS）统一从这里推导，
 * 保证站内不存在第二处域名定义。
 */
export const SITE = {
  url: 'https://www.yuuine.cn',
  title: 'Yuuine',
  author: 'Yuuine',
  description: '技术博客，分享 Java、分布式、DevOps、AI 等领域的知识与实践',
  keywords: ['blog', '技术博客', 'Java', '分布式', 'DevOps', 'AI', 'LLM', 'MCP'],
  github: 'https://github.com/Yuuine',
  /** 导航结构：新增板块只需在这里加一项 */
  nav: [
    { href: '/articles/', label: '文章' },
    { href: '/projects/', label: '项目' },
    { href: '/about/', label: '关于' },
  ],
} as const;

/** 拼绝对 URL，避免出现 "https://host" + "path" 少斜杠的问题 */
export function absoluteUrl(path = '/'): string {
  return new URL(path, SITE.url).toString();
}
