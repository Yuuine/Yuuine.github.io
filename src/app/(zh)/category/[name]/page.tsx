import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import CategoryView from '@/views/CategoryView';
import { getCategoryCounts } from '@/lib/articles';
import { getDictionary } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

const locale = 'zh-CN';
const dict = getDictionary(locale);

interface Props {
  params: Promise<{ name: string }>;
}

/** 分类是封闭集合，不在列表内的直接 404，避免 catch-all 吞掉未定义路径 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const categories = await getCategoryCounts();
  return categories.map((c) => ({ name: c.name }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { name } = await params;
  const count = (await getCategoryCounts()).find((c) => c.name === name)?.count ?? 0;
  const display = dict.categories[name] ?? name;

  return buildMetadata({
    path: `/category/${name}/`,
    locale,
    title: display,
    description: dict.category.description(display, count),
  });
}

export default async function CategoryPage({ params }: Props) {
  const { name } = await params;
  const exists = (await getCategoryCounts()).some((c) => c.name === name);
  if (!exists) notFound();

  return <CategoryView locale={locale} slug={name} />;
}
