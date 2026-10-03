import Link from 'next/link';
import { NAV, SITE } from '@/lib/site';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';

export default function SiteFooter({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__col">
          <p className="footer__brand">{SITE.title}</p>
        </div>

        <nav className="footer__col" aria-label={dict.footer.navAria}>
          <p className="footer__title">{dict.footer.navTitle}</p>
          <ul>
            {NAV.map((item) => (
              <li key={item.path}>
                <Link href={localeHref(locale, item.path)}>{dict.nav[item.key]}</Link>
              </li>
            ))}
            {/* 只有一份中文源，订阅源也就不分语言。
                这里必须用普通 <a>：<Link> 会把 /atom.xml 当成路由去预取 RSC 数据，
                而它只是个静态文件，每次预取都换来一个 404 */}
            <li>
              <a href="/atom.xml">RSS</a>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label={dict.footer.elsewhereAria}>
          <p className="footer__title">{dict.footer.elsewhereTitle}</p>
          <ul>
            <li>
              <a href={SITE.github} target="_blank" rel="noreferrer noopener">
                GitHub
              </a>
            </li>
          </ul>
        </nav>
      </div>

      <div className="footer__bottom container">
        <p>
          © {new Date().getFullYear()} {SITE.author}
        </p>
      </div>
    </footer>
  );
}
