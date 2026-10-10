import DocsNav from './DocsNav';
import type { DocsGroup } from '@/lib/docs';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';

/**
 * 文章区外壳：左边导航树，右边正文。
 *
 * 树由调用方取好传进来 —— 组件层不碰内容，与 SiteChrome 只读字典是同一条界线。
 *
 * 外壳是 grid，列宽交给 docs.css 按 <html data-nav> 切。收起状态不能在这里算：
 * 它要在首次绘制前就生效，只能由预绘制脚本写属性、CSS 读属性。
 */
export default function DocsShell({
  locale,
  groups,
  children,
}: {
  locale: Locale;
  groups: DocsGroup[];
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <div className="docs">
      <DocsNav
        groups={groups}
        indexHref={localeHref(locale, '/articles/')}
        indexLabel={dict.docs.all}
        navLabel={dict.docs.nav}
        toggleLabel={dict.docs.toggle}
      />
      <div className="docs__main">{children}</div>
    </div>
  );
}
