import { getAllArticles, getCategoryCounts } from './articles';
import { getDictionary, localeHref, type Locale } from './i18n';

export interface DocsEntry {
  title: string;
  href: string;
  date: string;
}

export interface DocsGroup {
  name: string;
  label: string;
  href: string;
  articles: DocsEntry[];
}

/**
 * 文章区的文档树：分类作分组，文章作叶子。左栏与索引页共用这一份 ——
 * 两处各排各的，同一批文章在两个地方的次序就会对不上。
 *
 * 分组的先后取自 getCategoryCounts（篇数多的在前），不是各自再排一遍。
 * 一篇文章有多个分类时会在多个分组里各出现一次，这是对的：分类是主题入口，
 * 不是排他的归属。
 */
export async function getDocsTree(locale: Locale): Promise<DocsGroup[]> {
  const dict = getDictionary(locale);
  const [articles, counts] = await Promise.all([getAllArticles(), getCategoryCounts()]);

  const byCategory = new Map<string, DocsEntry[]>();
  for (const a of articles) {
    for (const c of a.categories) {
      const list = byCategory.get(c) ?? [];
      list.push({ title: a.title, href: localeHref(locale, a.permalink), date: a.date });
      byCategory.set(c, list);
    }
  }

  return counts
    .filter((c) => byCategory.has(c.name))
    .map((c) => ({
      name: c.name,
      label: dict.categories[c.name] ?? c.name,
      href: localeHref(locale, `/category/${c.name}/`),
      articles: byCategory.get(c.name) ?? [],
    }));
}

/**
 * 线性阅读顺序：把文档树摊平，每篇只留一次。
 *
 * 与左栏刻意不同 —— 左栏里一篇挂了多个分类的文章要在每个分类下都出现，那是导航；
 * 而线性阅读时它只能算一处，留两次会让"下一篇"从它自己指到它自己。
 * 顺序与索引页的分节顺序一致，所以文章的上下篇就是索引页往下数的那两篇。
 */
export async function getReadingOrder(locale: Locale): Promise<DocsEntry[]> {
  const groups = await getDocsTree(locale);
  const seen = new Set<string>();
  const order: DocsEntry[] = [];

  for (const group of groups) {
    for (const entry of group.articles) {
      if (seen.has(entry.href)) continue;
      seen.add(entry.href);
      order.push(entry);
    }
  }

  return order;
}
