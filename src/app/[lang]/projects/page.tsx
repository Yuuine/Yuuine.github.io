import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ProjectsView from '@/views/ProjectsView';
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
    path: '/projects/',
    locale: lang,
    title: dict.projects.title,
    description: dict.projects.description,
  });
}

export default async function LocalizedProjectsPage({ params }: Props) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  return <ProjectsView locale={lang} />;
}
