import type { Metadata } from 'next';
import HomeView from '@/views/HomeView';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({ path: '/', locale: 'zh-CN' });

export default function HomePage() {
  return <HomeView locale="zh-CN" />;
}
