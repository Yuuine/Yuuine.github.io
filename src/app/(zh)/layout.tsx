import type { Metadata } from 'next';
import RootShell from '@/components/RootShell';
import { buildRootMetadata } from '@/lib/seo';

export const metadata: Metadata = buildRootMetadata('zh-CN');

export default function ZhRootLayout({ children }: { children: React.ReactNode }) {
  return <RootShell locale="zh-CN">{children}</RootShell>;
}
