import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/pages.css';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * 无闪烁主题脚本。
 *
 * 放在 <body> 的第一个子节点：解析到这里就同步执行，早于任何绘制，效果等同于放 <head>，
 * 但不必用 <head> 元素 —— 在 app/ 之外写 <head> 会触发 no-head-element 规则，
 * 而 next/head 是 Pages Router 的 API，在这里并不适用。
 *
 * 缺省即浅色（<html> 上不加 class），只有选过深色的访客需要在这里恢复。
 */
const themeScript = `
(function () {
  try {
    if (localStorage.getItem('theme') === 'dark') {
      document.documentElement.classList.add('is-dark-mode');
    }
  } catch {}
})();
`;

/**
 * 根布局外壳。
 *
 * 中文留在根路径、其余语言带前缀，所以路由上分成两支，而 Next 只允许 root layout
 * 渲染 <html> —— 两支各有一个 layout，<html>/<body> 与页头页脚收敛到这里，
 * 两边的差别就只有 lang 和文案。
 */
export default function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <a className="skip-link" href="#main">
          {dict.header.skip}
        </a>
        <SiteHeader locale={locale} />
        <main id="main">{children}</main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
