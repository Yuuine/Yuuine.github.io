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
          <p className="footer__note">{dict.siteDescription}</p>
        </div>

        <nav className="footer__col" aria-label={dict.footer.navAria}>
          <p className="footer__title">{dict.footer.navTitle}</p>
          <ul>
            {NAV.map((item) => (
              <li key={item.path}>
                <Link href={localeHref(locale, item.path)}>{dict.nav[item.key]}</Link>
              </li>
            ))}
            {/* 只有一份中文源，订阅源也就不分语言 */}
            <li>
              <Link href="/atom.xml">RSS</Link>
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
        <p className="footer__meta">{dict.footer.meta}</p>
      </div>
    </footer>
  );
}
