import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getAllArticles, getCategoryCounts } from '@/lib/articles';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';

export default async function ArticlesView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const articles = await getAllArticles();
  const categories = await getCategoryCounts();

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">{dict.articles.eyebrow}</p>
        <h1>{dict.articles.title}</h1>
        <p className="lead">{dict.articles.lead(articles.length)}</p>
        {/* 分类走真路由，不是查询参数 —— 查询参数在静态导出下不会生成独立页面 */}
        <nav className="filter-bar" aria-label={dict.articles.filterAria}>
          <Link href={localeHref(locale, '/articles/')} className="is-active">
            {dict.articles.filterAll(articles.length)}
          </Link>
          {categories.map((c) => (
            <Link key={c.name} href={localeHref(locale, `/category/${c.name}/`)}>
              {dict.categories[c.name] ?? c.name} {c.count}
            </Link>
          ))}
        </nav>
      </header>

      <ul className="card-grid" style={{ paddingBottom: 'var(--sp-8)' }}>
        {articles.map((a) => (
          <ArticleCard
            key={a.permalink}
            article={a}
            locale={locale}
            minutesLabel={dict.common.minutes(a.minutes)}
          />
        ))}
      </ul>
    </div>
  );
}
