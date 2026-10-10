import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';

/**
 * 分类页。
 *
 * 分类是真路由而不是查询参数 —— 静态导出下 `?category=` 不会生成独立页面，
 * 搜索引擎既看不到主题入口，也没法把旧站的 /categories/* 指过来。
 * 每篇文章因此多一条来自主题页的入站内链。
 */
export default async function CategoryView({
  locale,
  slug,
}: {
  locale: Locale;
  slug: string;
}) {
  const dict = getDictionary(locale);
  const name = dict.categories[slug] ?? slug;
  const articles = (await getAllArticles()).filter((a) => a.categories.includes(slug));

  return (
    <div className="doc-body">
      <header className="page-head">
        <p className="eyebrow">{dict.category.eyebrow}</p>
        <h1>{name}</h1>
      </header>

      <ul className="doc-list">
        {articles.map((a) => (
          <li key={a.permalink}>
            <Link className="doc-list__link" href={localeHref(locale, a.permalink)}>
              <span className="doc-list__title">{a.title}</span>
              <time className="doc-list__date" dateTime={a.date}>
                {formatDate(a.date)}
              </time>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
