import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryView from '@/views/CategoryView';
import { getCategoryCounts } from '@/lib/articles';
import { getDictionary, isLocale } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ lang: string; name: string }>;
}

export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategoryCounts();
  return categories.map((c) => ({ name: c.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, name } = await params;
  if (!isLocale(lang)) return {};

  const dict = getDictionary(lang);
  const count = (await getCategoryCounts()).find((c) => c.name === name)?.count ?? 0;
  const display = dict.categories[name] ?? name;

  return buildMetadata({
    path: `/category/${name}/`,
    locale: lang,
    title: display,
    description: dict.category.description(display, count),
  });
}

export default async function LocalizedCategoryPage({ params }: Props) {
  const { lang, name } = await params;
  if (!isLocale(lang)) notFound();

  const exists = (await getCategoryCounts()).some((c) => c.name === name);
  if (!exists) notFound();

  return <CategoryView locale={lang} slug={name} />;
}
