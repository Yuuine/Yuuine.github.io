import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticleView from '@/views/ArticleView';
import { getAllArticles, getArticleBySlug } from '@/lib/articles';
import { isLocale } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ lang: string; slug: string[] }>;
}

/**
 * 与中文那一支共用同一批 slug，由父级 layout 的 generateStaticParams 提供 lang，
 * Next 自行做笛卡尔积。文章正文目前只有中文，所以 metadata 里标 translated: false。
 */
export async function generateStaticParams() {
  const articles = await getAllArticles();
  return articles.map((a) => ({ slug: a.slug.split('/') }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const article = await getArticleBySlug(slug.join('/'));
  if (!article) return {};

  return buildMetadata({
    path: article.permalink,
    locale: lang,
    title: article.title,
    description: article.description,
    type: 'article',
    publishedTime: article.date,
    tags: article.tags,
    translated: false,
  });
}

export default async function LocalizedArticlePage({ params }: Props) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const article = await getArticleBySlug(slug.join('/'));
  if (!article) notFound();

  return <ArticleView article={article} locale={lang} />;
}
