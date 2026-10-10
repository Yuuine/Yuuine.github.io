import Link from 'next/link';
import ArticleCard from '@/components/ArticleCard';
import { getAllArticles } from '@/lib/articles';
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
              <ArticleCard
                key={a.permalink}
                article={a}
                locale={locale}
                minutesLabel={dict.common.minutes(a.minutes)}
              />
            ))}
          </ul>
        </section>
      </div>
    </>
  );
}
