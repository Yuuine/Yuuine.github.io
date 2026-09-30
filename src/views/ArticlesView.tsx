import Link from 'next/link';
import { getAllArticles, getCategoryCounts } from '@/lib/articles';
import { formatDate } from '@/lib/format';
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
        <nav className="filter-bar" aria-label={dict.articles.filterAria}>
          <Link href={localeHref(locale, '/articles/')} className="is-active">
            {dict.articles.filterAll(articles.length)}
          </Link>
          {categories.map((c) => (
            <Link
              key={c.name}
              href={`${localeHref(locale, '/articles/')}?category=${c.name}`}
            >
              {c.name} {c.count}
            </Link>
          ))}
        </nav>
      </header>

      <ul className="card-grid" style={{ paddingBottom: 'var(--sp-8)' }}>
        {articles.map((a) => (
          <li key={a.permalink}>
            <Link className="card" href={localeHref(locale, a.permalink)}>
              <div className="card__meta">
                <time dateTime={a.date}>{formatDate(a.date)}</time>
                <span className="card__dot" />
                <span>{a.categories.join(' / ')}</span>
              </div>
              <h3 className="card__title">{a.title}</h3>
              <p className="card__desc">{a.description}</p>
              <div className="card__foot">
                <span>{dict.common.minutes(a.minutes)}</span>
                <span className="card__tags">{a.tags.slice(0, 3).join(' · ')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
