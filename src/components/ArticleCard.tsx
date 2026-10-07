import Link from 'next/link';
import type { ArticleMeta } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import { localeHref, type Locale } from '@/lib/i18n';

/** 文章卡片，文章列表与分类页共用同一份，避免两处各写一遍后走样 */
export default function ArticleCard({
  article,
  locale,
  minutesLabel,
}: {
  article: ArticleMeta;
  locale: Locale;
  minutesLabel: string;
}) {
  return (
    <li>
      <Link className="card" href={localeHref(locale, article.permalink)}>
        <div className="card__meta">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span className="card__dot" />
          <span>{article.categories.join(' / ')}</span>
        </div>
        <h3 className="card__title">{article.title}</h3>
        <p className="card__desc">{article.description}</p>
        <div className="card__foot">
          <span>{minutesLabel}</span>
          <span className="card__tags">{article.tags.slice(0, 3).join(' · ')}</span>
        </div>
      </Link>
    </li>
  );
}
