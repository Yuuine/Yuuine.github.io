import type { Metadata } from 'next';
import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/pages.css';
import SiteHeader from '@/components/SiteHeader';
import SiteFooter from '@/components/SiteFooter';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.title} · 技术笔记`,
    template: `%s · ${SITE.title}`,
  },
  description: SITE.description,
  keywords: [...SITE.keywords],
  authors: [{ name: SITE.author }],
  openGraph: {
    type: 'website',
    siteName: SITE.title,
    locale: 'zh_CN',
  },
  twitter: { card: 'summary_large_image' },
  alternates: {
    types: { 'application/atom+xml': '/atom.xml' },
  },
  // SVG 放前面给现代浏览器，ICO 作为回退
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
};

/**
 * 无闪烁主题脚本：必须在样式生效前同步执行，
 * 否则暗色偏好的用户会看到一瞬白屏。
 */
const themeScript = `
(function () {
  try {
    var root = document.documentElement;
    var saved = localStorage.getItem('theme');
    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    var dark = saved ? saved === 'dark' : prefersDark;
    root.classList.toggle('is-dark-mode', dark);
    root.classList.toggle('is-light-mode', !dark);
    if (localStorage.getItem('motion') === 'off') {
      root.classList.add('has-reduced-motion');
    }
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <a className="skip-link" href="#main">
          跳到正文
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
