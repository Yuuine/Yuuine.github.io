import SiteChrome from './SiteChrome';
import type { Locale } from '@/lib/i18n';

/**
 * 根布局外壳。
 *
 * 中文留在根路径、其余语言带前缀，所以路由上分成两支，而 Next 只允许 root layout
 * 渲染 <html> —— 两支各有一个 layout，<html>/<body> 收敛到这里，
 * 剩下的站点外壳交给 SiteChrome，两边就只有 lang 的差别。
 */
export default function RootShell({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <SiteChrome locale={locale}>{children}</SiteChrome>
      </body>
    </html>
  );
}
