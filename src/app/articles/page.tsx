import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllArticles, getCategoryCounts } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  path: '/articles/',
  title: '文章',
  description: '全部技术笔记：Java 并发、分布式中间件、SQL 与 AI 工程实践。',
});

export default async function ArticlesPage() {
  const articles = await getAllArticles();
  const categories = await getCategoryCounts();

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Articles</p>
        <h1>文章</h1>
        <p className="lead">
          共 {articles.length} 篇。按时间倒序，写的是我实际踩过的东西。
        </p>
        <nav className="filter-bar" aria-label="分类">
          <Link href="/articles/" className="is-active">
            全部 {articles.length}
          </Link>
          {categories.map((c) => (
            <Link key={c.name} href={`/articles/?category=${c.name}`}>
              {c.name} {c.count}
            </Link>
          ))}
        </nav>
      </header>

      <ul className="card-grid" style={{ paddingBottom: 'var(--sp-8)' }}>
        {articles.map((a) => (
          <li key={a.permalink}>
            <Link className="card" href={a.permalink}>
              <div className="card__meta">
                <time dateTime={a.date}>{formatDate(a.date)}</time>
                <span className="card__dot" />
                <span>{a.categories.join(' / ')}</span>
              </div>
              <h3 className="card__title">{a.title}</h3>
              <p className="card__desc">{a.description}</p>
              <div className="card__foot">
                <span>{a.minutes} 分钟</span>
                <span className="card__tags">{a.tags.slice(0, 3).join(' · ')}</span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
