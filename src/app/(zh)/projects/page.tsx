import type { Metadata } from 'next';
import ProjectsView from '@/views/ProjectsView';
import { getDictionary } from '@/lib/i18n';
import { buildMetadata } from '@/lib/seo';

const locale = 'zh-CN';
const dict = getDictionary(locale);

export const metadata: Metadata = buildMetadata({
  path: '/projects/',
  locale,
  title: dict.projects.title,
  description: dict.projects.description,
});

export default function ProjectsPage() {
  return <ProjectsView locale={locale} />;
}
