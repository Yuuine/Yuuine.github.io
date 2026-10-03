import type { NextConfig } from 'next';

/**
 * 站点常量：canonical / sitemap / og:url 全部由 src/lib/site.ts 推导，
 * 这里只管构建配置。
 */
const nextConfig: NextConfig = {
  /**
   * 静态导出：产物在 out/，可直接交给 GitHub Pages 或 Cloudflare Pages。
   * 代价是 next/image 的按需优化不可用。
   */
  output: 'export',

  /**
   * 产出 /path/index.html，并把无斜杠请求重定向过去。
   * 站内文章 URL 一律以 / 结尾，改动会导致既有链接 404。
   */
  trailingSlash: true,

  images: {
    unoptimized: true,
  },

  /**
   * 构建期渲染 Mermaid 要靠 Playwright 启动浏览器，而 Playwright 是用动态 require
   * 去定位浏览器可执行文件的 —— 被打进 server bundle 之后这条路就断了，
   * 报错是 `o.resolve is not a function`。这几个包必须保持外部引用。
   */
  serverExternalPackages: ['rehype-mermaid', 'mermaid-isomorphic', 'playwright'],
};

export default nextConfig;
