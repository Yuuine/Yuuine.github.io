import DocsShell from '@/components/DocsShell';
import { getDocsTree } from '@/lib/docs';

const locale = 'zh-CN';

/**
 * 文章区的外壳。路由组不产生路径段，所以文章索引、各分类页与每篇文章的 URL
 * 一个都没变，只是从此共用同一侧左栏 —— 换页时栏不动，才读得出"同一本手册"。
 * 项目与关于留在组外，它们不是这本手册的章节。
 */
export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const groups = await getDocsTree(locale);

  return (
    <DocsShell locale={locale} groups={groups}>
      {children}
    </DocsShell>
  );
}
