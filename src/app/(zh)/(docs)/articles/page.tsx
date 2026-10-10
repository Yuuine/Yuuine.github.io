import type { Metadata } from 'next';
import ArticlesView from '@/views/ArticlesView';
import { getDictionary } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

const locale = 'zh-CN';
const dict = getDictionary(locale);

export const metadata: Metadata = buildMetadata({
  path: '/articles/',
  locale,
  title: dict.articles.title,
  description: dict.articles.description,
});

export default function ArticlesPage() {
  return <ArticlesView locale={locale} />;
}
