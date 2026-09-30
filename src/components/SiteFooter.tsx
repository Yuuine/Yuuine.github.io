import Link from 'next/link';
import { SITE } from '@/lib/site';

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner container">
        <div className="footer__col">
          <p className="footer__brand">{SITE.title}</p>
          <p className="footer__note">{SITE.description}</p>
        </div>

        <nav className="footer__col" aria-label="页脚导航">
          <p className="footer__title">导航</p>
          <ul>
            {SITE.nav.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
            <li>
              <Link href="/atom.xml">RSS</Link>
            </li>
          </ul>
        </nav>

        <nav className="footer__col" aria-label="外部链接">
          <p className="footer__title">在别处</p>
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
        <p className="footer__meta">Next.js · 自建主题</p>
      </div>
    </footer>
  );
}
