import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import HomeView from '@/views/HomeView';
import { isLocale } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? buildMetadata({ path: '/', locale: lang }) : {};
}

export default async function LocalizedHomePage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <HomeView locale={lang} />;
}
