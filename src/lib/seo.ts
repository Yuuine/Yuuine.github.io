import type { Metadata } from 'next';
import { SITE, absoluteUrl } from './site';
import { DEFAULT_LOCALE, LOCALES, getDictionary, localeHref, type Locale } from './i18n';

const OG_LOCALE: Record<Locale, string> = {
  'zh-CN': 'zh_CN',
  'zh-TW': 'zh_TW',
  en: 'en_US',
};

// SVG 放前面给现代浏览器，ICO 作为回退
const ICONS: Metadata['icons'] = {
  icon: [
    { url: '/favicon.svg', type: 'image/svg+xml' },
    { url: '/favicon.ico', sizes: '16x16 32x32 48x48 64x64' },
  ],
  apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
};

/**
 * 整站标题：`站点名 · 标语`。
 * 根 metadata 的 title.default 与首页自己的 og/twitter 标题都取自这里 ——
 * 同一个字符串写两遍，迟早只剩一处被改到。
 */
export function siteTitle(locale: Locale): string {
  return `${SITE.title} · ${getDictionary(locale).tagline}`;
}

/**
 * 页面标题。传了 title 走模板 `%s · 站点名`，没传就是整站标题 ——
 * 和 Next 的 title.default 行为保持一致。
 */
function pageTitle(locale: Locale, title?: string): string {
  return title ? `${title} · ${SITE.title}` : siteTitle(locale);
}

/** 根 metadata。各语言的 title 模板、图标、OG 站点信息只有文案不同，结构共用 */
export function buildRootMetadata(locale: Locale): Metadata {
  const dict = getDictionary(locale);

  return {
    metadataBase: new URL(SITE.url),
    title: {
      default: siteTitle(locale),
      template: `%s · ${SITE.title}`,
    },
    description: dict.siteDescription,
    keywords: [...SITE.keywords],
    authors: [{ name: SITE.author }],
    openGraph: {
      type: 'website',
      siteName: SITE.title,
      locale: OG_LOCALE[locale],
    },
    twitter: { card: 'summary_large_image' },
    icons: ICONS,
  };
}

interface SeoInput {
  /**
   * 页面路径，写「默认语言下的路径」，以 / 开头以 / 结尾（如 '/articles/'）。
   * 必填 —— 类型系统会强制每个页面传，这是防止"某个页面漏写 canonical"的第一道闸。
   */
  path: string;
  locale: Locale;
  title?: string;
  description?: string;
  type?: 'website' | 'article';
  /** 文章发布时间（ISO），仅 type='article' 时有意义 */
  publishedTime?: string;
  /** 文章标签，映射到 keywords 与 og 的 tag */
  tags?: string[];
  /**
   * 该页面在其它语言下是否有真正不同的内容。
   * false 时 canonical 收敛回默认语言，并且不发 hreflang ——
   * 「同一个页面」和「同一份内容的副本」是两回事，混在一起两个信号都会失效。
   */
  translated?: boolean;
}

/**
 * 统一构造页面 metadata。
 *
 * canonical、og:url 与 hreflang 收敛到单一入口，避免逐页手写时遗漏；
 * path 为必填参数，由类型系统强制每个页面传入。
 */
export function buildMetadata({
  path,
  locale,
  title,
  description,
  type = 'website',
  publishedTime,
  tags,
  translated = true,
}: SeoInput): Metadata {
  const dict = getDictionary(locale);
  const desc = description ?? dict.siteDescription;
  const href = localeHref(locale, path);

  return {
    // 没给标题就整个不写这个键。写成 `title: undefined` 会覆盖根布局的
    // title.default，把模板继承打断 —— 首页就是这样丢掉 <title> 的
    ...(title ? { title } : {}),
    description: desc,
    ...(tags?.length ? { keywords: tags } : {}),
    alternates: {
      canonical: translated ? href : localeHref(DEFAULT_LOCALE, path),
      ...(translated
        ? {
            languages: {
              ...Object.fromEntries(LOCALES.map((l) => [l, localeHref(l, path)])),
              'x-default': localeHref(DEFAULT_LOCALE, path),
            },
          }
        : {}),
    },
    openGraph: {
      type,
      url: absoluteUrl(href),
      siteName: SITE.title,
      locale: OG_LOCALE[locale],
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => OG_LOCALE[l]),
      title: pageTitle(locale, title),
      description: desc,
      // 分享卡由 scripts/build-brand.mjs 从字标路径生成，不依赖构建机字体
      images: [{ url: '/og.png', width: 1200, height: 630, alt: SITE.title }],
      ...(publishedTime ? { publishedTime } : {}),
      ...(tags?.length ? { tags } : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title: pageTitle(locale, title),
      description: desc,
      images: ['/og.png'],
    },
  };
}
