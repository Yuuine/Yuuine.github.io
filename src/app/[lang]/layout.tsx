import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import RootShell from '@/components/RootShell';
import { PREFIXED_LOCALES, isLocale } from '@/lib/i18n';
import { buildRootMetadata } from '@/lib/seo';

interface Props {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}

/**
 * 只有 /en/ 与 /zh-TW/ 走这条分支 —— 中文在根路径，由 (zh) 那一支负责。
 * 这里同时也是该分支的 root layout，所以 <html lang> 能跟着语言走。
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return PREFIXED_LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  return isLocale(lang) ? buildRootMetadata(lang) : {};
}

export default async function LangRootLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <RootShell locale={lang}>{children}</RootShell>;
}
