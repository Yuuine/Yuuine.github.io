import Link from 'next/link';
import { NAV, SITE } from '@/lib/site';
import { LOGO_PATH, LOGO_VIEW_BOX } from '@/lib/logo.mjs';
import { getDictionary, localeHref, type Locale } from '@/lib/i18n';
import LanguageSwitcher from './LanguageSwitcher';
import ThemeToggle from './ThemeToggle';

export default function SiteHeader({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);

  return (
    <header className="header">
      <div className="header__inner container">
        <Link
          href={localeHref(locale, '/')}
          className="brand"
          aria-label={`${SITE.title} — ${dict.header.home}`}
        >
          <span className="brand__mark" aria-hidden="true">
            <svg viewBox={LOGO_VIEW_BOX} width="26" height="26">
              <path fill="currentColor" d={LOGO_PATH} />
            </svg>
          </span>
          <span className="brand__text">{SITE.title}</span>
        </Link>

        <nav className="nav" aria-label={dict.header.navAria}>
          {NAV.map((item) => (
            <Link key={item.path} href={localeHref(locale, item.path)} className="nav__link">
              {dict.nav[item.key]}
            </Link>
          ))}
        </nav>

        <div className="header__actions">
          <LanguageSwitcher locale={locale} />
          <a
            className="icon-btn"
            href={SITE.github}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={dict.header.github}
          >
            <svg viewBox="0 0 16 16" width="17" height="17" fill="currentColor" aria-hidden="true">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.42 7.42 0 0 1 2-.27c.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
          </a>
          <ThemeToggle label={dict.header.theme} />
        </div>
      </div>
    </header>
  );
}
