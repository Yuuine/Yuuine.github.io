import type { NextConfig } from 'next';

/**
 * 站点常量：canonical / sitemap / RSS / og:url 全部由 src/lib/site.ts 推导，
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
};

export default nextConfig;
