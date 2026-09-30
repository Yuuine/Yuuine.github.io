import type { Metadata } from 'next';
import Link from 'next/link';

// 错误页不该被收录，也不需要 canonical
export const metadata: Metadata = {
  title: '页面不存在',
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="container not-found">
      <p className="not-found__code">404</p>
      <h1>这个页面不存在</h1>
      <p className="lead" style={{ marginInline: 'auto' }}>
        可能是链接写错了，或者这篇文章还没写。
      </p>
      <div className="hero__actions">
        <Link className="btn" href="/">
          回首页
        </Link>
        <Link className="btn btn--ghost" href="/articles/">
          看文章
        </Link>
      </div>
    </div>
  );
}
