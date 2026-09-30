import type { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary, localeHref } from '@/lib/i18n';

const dict = getDictionary('zh-CN');

// 错误页不该被收录，也不需要 canonical
export const metadata: Metadata = {
  title: dict.notFound.title,
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="not-found__code">404</p>
      <h1>{dict.notFound.heading}</h1>
      <p className="lead" style={{ marginInline: 'auto' }}>
        {dict.notFound.lead}
      </p>
      <div className="btn-row">
        <Link className="btn" href={localeHref('zh-CN', '/')}>
          {dict.notFound.home}
        </Link>
        <Link className="btn btn--ghost" href={localeHref('zh-CN', '/articles/')}>
          {dict.notFound.articles}
        </Link>
      </div>
    </div>
  );
}
