import '@/styles/tokens.css';
import '@/styles/base.css';
import '@/styles/components.css';
import '@/styles/pages/home.css';
import '@/styles/pages/inner.css';
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
 * 站点外壳：全局样式、主题脚本、跳转链接、页头、正文、页脚。
 *
 * 与 RootShell 拆开是为了 404 —— out/404.html 由 app/not-found.tsx 生成，
 * 而它落在两个 root layout 之外（root layout 分别在 (zh)/ 和 [lang]/），
 * 既没有 <html> 也拿不到全局样式。外壳收敛到一处，两条路径就不会各长各的。
 */
export default function SiteChrome({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const dict = getDictionary(locale);

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      <a className="skip-link" href="#main">
        {dict.header.skip}
      </a>
      <SiteHeader locale={locale} />
      <main id="main">{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
