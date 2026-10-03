import Link from 'next/link';
import { getAllArticles } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';
import Hero from './home/Hero';

export default async function HomeView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const articles = await getAllArticles();
  const featured = articles.slice(0, 4);

  return (
    <>
      <Hero />

      <div className="container">
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">{dict.home.eyebrow}</p>
              <h2>{dict.home.recent}</h2>
            </div>
            <Link className="section-title__more" href={localeHref(locale, '/articles/')}>
              {dict.home.all(articles.length)}
            </Link>
          </div>

          <ul className="card-grid">
            {featured.map((a) => (
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
        </section>
      </div>
    </>
  );
}
