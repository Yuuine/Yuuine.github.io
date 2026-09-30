import type { Metadata } from 'next';
import { SITE, absoluteUrl } from './site';

interface SeoInput {
  /**
   * 页面路径，必须以 / 开头、以 / 结尾（如 '/articles/'）。
   * 必填 —— 类型系统会强制每个页面传，这是防止"某个页面漏写 canonical"的第一道闸。
   */
  path: string;
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  /** 文章发布时间（ISO），仅 type='article' 时有意义 */
  publishedTime?: string;
  /** 文章标签，映射到 keywords 与 og 的 tag */
  tags?: string[];
}

/**
 * 统一构造页面 metadata。
 *
 * canonical 与 og:url 收敛到单一入口，避免逐页手写时遗漏；
 * path 为必填参数，由类型系统强制每个页面传入。
 */
export function buildMetadata({
  path,
  title,
  description = SITE.description,
  type = 'website',
  publishedTime,
  tags,
}: SeoInput): Metadata {
  const url = absoluteUrl(path);

  return {
    title,
    description,
    ...(tags?.length ? { keywords: tags } : {}),
    alternates: {
      canonical: path,
    },
    openGraph: {
      type,
      url,
      siteName: SITE.title,
      locale: 'zh_CN',
      title: title ? `${title} · ${SITE.title}` : SITE.title,
      description,
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: title ? `${title} · ${SITE.title}` : SITE.title,
      description,
    },
  };
}
