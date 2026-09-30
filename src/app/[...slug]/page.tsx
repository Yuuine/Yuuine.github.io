import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import 'katex/dist/katex.min.css';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import { renderMarkdown } from '@/lib/markdown';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ slug: string[] }>;
}

/**
 * 只用静态参数：任何不在列表里的路径直接 404，
 * 避免 root 级 catch-all 把 /articles、/projects 之类也吞掉。
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug.join('/'));
  if (!article) return {};

  return buildMetadata({
    path: article.permalink,
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.date,
    tags: article.tags,
  });
}

export default async function ArticlePage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug.join('/'));
  if (!article) notFound();

  const html = await renderMarkdown(article.body);
  const all = await getAllArticles();
  const index = all.findIndex((a) => a.slug === article.slug);
  const newer = index > 0 ? all[index - 1] : undefined;
  const older = index < all.length - 1 ? all[index + 1] : undefined;

  return (
    <article className="article container--text">
      <header className="article__header">
        <div className="article__meta">
          <time dateTime={article.date}>{formatDate(article.date)}</time>
          <span className="card__dot" />
          <span>{article.minutes} 分钟</span>
          <span className="card__dot" />
          <span>{article.categories.join(' / ')}</span>
        </div>
        <h1 className="article__title">{article.title}</h1>
        {article.description && <p className="article__desc">{article.description}</p>}
      </header>

      <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

      {article.tags.length > 0 && (
        <ul className="article__tags">
          {article.tags.map((t) => (
            <li key={t}>#{t}</li>
          ))}
        </ul>
      )}

      <nav className="article__nav" aria-label="上下篇">
        {older ? (
          <Link href={older.permalink} className="article__nav-item">
            <span className="article__nav-label">上一篇</span>
            <span className="article__nav-title">{older.title}</span>
          </Link>
        ) : (
          <span />
        )}
        {newer ? (
          <Link href={newer.permalink} className="article__nav-item article__nav-item--next">
            <span className="article__nav-label">下一篇</span>
            <span className="article__nav-title">{newer.title}</span>
          </Link>
        ) : (
          <span />
        )}
      </nav>
    </article>
  );
}
