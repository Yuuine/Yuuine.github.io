import type { Metadata } from 'next';
import Link from 'next/link';
import SiteChrome from '@/components/SiteChrome';
import { getDictionary, localeHref } from '@/lib/i18n';

/**
 * 404 的静态产物是 out/404.html，GitHub Pages 用它接住所有未知路径。
 *
 * 它落在两个 root layout 之外，而 <html> 只能由 root layout 渲染，所以这一页拿不到
 * <html lang>，语言只能固定成默认语言一份；全局样式与页头页脚由 SiteChrome 补齐。
 */
const LOCALE = 'zh-CN';
const dict = getDictionary(LOCALE);

// 错误页不该被收录，也不需要 canonical
export const metadata: Metadata = {
  title: dict.notFound.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <SiteChrome locale={LOCALE}>
      <div className="container not-found">
        <p className="not-found__code">404</p>
        <h1>{dict.notFound.heading}</h1>
        <p className="lead" style={{ marginInline: 'auto' }}>
          {dict.notFound.lead}
        </p>
        <div className="btn-row">
          <Link className="btn" href={localeHref(LOCALE, '/')}>
            {dict.notFound.home}
          </Link>
          <Link className="btn btn--ghost" href={localeHref(LOCALE, '/articles/')}>
            {dict.notFound.articles}
          </Link>
        </div>
      </div>
    </SiteChrome>
  );
}
