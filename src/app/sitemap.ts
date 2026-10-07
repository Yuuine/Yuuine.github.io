import type { MetadataRoute } from 'next';
import { getAllArticles, getCategoryCounts } from '@/lib/articles';
import { DEFAULT_LOCALE, PREFIXED_LOCALES } from '@/lib/i18n';
import { SITE } from '@/lib/site';

// 静态导出下，约定文件必须显式声明为静态，否则构建报错
export const dynamic = 'force-static';

type Entry = MetadataRoute.Sitemap[number];

/** 界面页在三种语言下是真的三份内容，互相声明为语言替代版本 */
const UI_ROUTES: ReadonlyArray<{ path: string; priority: number; changeFrequency: Entry['changeFrequency'] }> = [
  { path: '/', priority: 1, changeFrequency: 'weekly' },
  { path: '/articles/', priority: 0.9, changeFrequency: 'weekly' },
  { path: '/projects/', priority: 0.7, changeFrequency: 'monthly' },
  { path: '/about/', priority: 0.6, changeFrequency: 'yearly' },
];

/**
 * sitemap.xml —— 绝对 URL 一律走 SITE.url，保证与 canonical 指向同一域名。
 *
 * 文章正文只有中文，非中文的文章页 canonical 收敛回中文原文（见 buildMetadata 的
 * translated），所以这里只列中文那一条，不把副本喂给搜索引擎。
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [articles, categories] = await Promise.all([getAllArticles(), getCategoryCounts()]);
  const locales = [DEFAULT_LOCALE, ...PREFIXED_LOCALES];

  const href = (locale: string, path: string) =>
    locale === DEFAULT_LOCALE ? `${SITE.url}${path}` : `${SITE.url}/${locale}${path}`;

  const uiRoutes: MetadataRoute.Sitemap = UI_ROUTES.flatMap((route) =>
    locales.map((locale) => ({
      url: href(locale, route.path),
      changeFrequency: route.changeFrequency,
      priority: route.priority,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, href(l, route.path)])),
      },
    })),
  );

  // 分类页是主题入口，和界面页一样在三种语言下各有一份
  const categoryRoutes: MetadataRoute.Sitemap = categories.flatMap((c) =>
    locales.map((locale) => ({
      url: href(locale, `/category/${c.name}/`),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
      alternates: {
        languages: Object.fromEntries(locales.map((l) => [l, href(l, `/category/${c.name}/`)])),
      },
    })),
  );

  const articleRoutes: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${SITE.url}${a.permalink}`,
    // 用 updated 而不是 date：改了老文章，sitemap 才会跟着动
    lastModified: new Date(a.updated),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  return [...uiRoutes, ...categoryRoutes, ...articleRoutes];
}
