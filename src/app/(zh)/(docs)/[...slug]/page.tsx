import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleView from '@/views/ArticleView';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import { buildMetadata } from '@/lib/seo';

const locale = 'zh-CN';

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
    locale,
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

  return <ArticleView article={article} locale={locale} />;
}
