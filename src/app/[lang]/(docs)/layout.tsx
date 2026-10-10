import { notFound } from 'next/navigation';
import DocsShell from '@/components/DocsShell';
import { getDocsTree } from '@/lib/docs';
import { isLocale } from '@/lib/i18n';

interface Props {
  params: Promise<{ lang: string }>;
  children: React.ReactNode;
}

/** 与中文那一支同构，树按当前语言取 href；正文仍是同一份中文，所以 href 换前缀即可 */
export default async function LocalizedDocsLayout({ children, params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const groups = await getDocsTree(lang);

  return (
    <DocsShell locale={lang} groups={groups}>
      {children}
    </DocsShell>
  );
}
