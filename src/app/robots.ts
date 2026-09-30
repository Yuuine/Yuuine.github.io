import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// 静态导出下，约定文件必须显式声明为静态，否则构建报错
export const dynamic = 'force-static';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
