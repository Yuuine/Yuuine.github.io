import type { MetadataRoute } from 'next';
import { getAllArticles } from '@/lib/articles';
import { SITE } from '@/lib/site';

// 静态导出下，约定文件必须显式声明为静态，否则构建报错
export const dynamic = 'force-static';

/** sitemap.xml —— 绝对 URL 一律走 SITE.url，保证与 canonical 指向同一域名 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getAllArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/articles/`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/projects/`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE.url}/about/`, changeFrequency: 'yearly', priority: 0.6 },
  ];

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}${a.permalink}`,
    lastModified: new Date(a.date),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...staticRoutes, ...articleRoutes];
}
