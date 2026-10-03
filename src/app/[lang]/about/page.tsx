import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import AboutView from '@/views/AboutView';
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
    path: '/about/',
    locale: lang,
    title: dict.about.title,
  });
}

export default async function LocalizedAboutPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <AboutView locale={lang} />;
}
