import type { Metadata } from 'next';
import AboutView from '@/views/AboutView';
import { getDictionary } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

const locale = 'zh-CN';
const dict = getDictionary(locale);

export const metadata: Metadata = buildMetadata({
  path: '/about/',
  locale,
  title: dict.about.title,
});

export default function AboutPage() {
  return <AboutView locale={locale} />;
}
