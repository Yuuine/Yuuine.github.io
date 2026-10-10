import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ArticlesView from '@/views/ArticlesView';
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = getDictionary(lang);

  return buildMetadata({
    path: '/articles/',
    locale: lang,
    title: dict.articles.title,
    description: dict.articles.description,
  });
}

export default async function LocalizedArticlesPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <ArticlesView locale={lang} />;
}
