import { zhCN } from './dictionaries/zh-CN';
import { zhTW } from './dictionaries/zh-TW';
import { en } from './dictionaries/en';

export const LOCALES = ['zh-CN', 'zh-TW', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

/**
 * 字典类型来自简体中文。另外两份不做类型标注，而是在下面赋给
 * Record<Locale, Dictionary> 时校验 —— 这样字典文件之间不需要互相 import，
 * 少一处循环依赖，漏字段一样会在构建期报错。
 */
export type Dictionary = typeof zhCN;

const DICTIONARIES: Record<Locale, Dictionary> = {
  'zh-CN': zhCN,
  'zh-TW': zhTW,
  en,
};

/**
 * 中文留在根路径，其余语言走 /<lang>/ 前缀。
 * 静态导出做不了重定向，一旦给中文加前缀，19 篇历史文章的 URL 就没有退路。
 */
export const DEFAULT_LOCALE: Locale = 'zh-CN';
export const PREFIXED_LOCALES = LOCALES.filter((l) => l !== DEFAULT_LOCALE) as Locale[];

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export function getDictionary(locale: Locale): Dictionary {
  return DICTIONARIES[locale];
}

/** 语言名一律用该语言自己的写法，切换器里不再翻译 */
export function localeName(locale: Locale): string {
  return DICTIONARIES[locale].localeName;
}

/**
 * 把「默认语言下的路径」翻译成指定语言下的路径。
 * 传入的 path 必须不带语言前缀（如 '/articles/'）。
 */
export function localeHref(locale: Locale, path = '/'): string {
  if (locale === DEFAULT_LOCALE) return path;
  return path === '/' ? `/${locale}/` : `/${locale}${path}`;
}

/** localeHref 的逆运算：剥掉语言前缀，回到默认语言下的路径 */
export function stripLocale(pathname: string): string {
  for (const locale of PREFIXED_LOCALES) {
    if (pathname === `/${locale}` || pathname === `/${locale}/`) return '/';
    if (pathname.startsWith(`/${locale}/`)) return pathname.slice(locale.length + 1);
  }
  return pathname;
}

export { DICTIONARIES };
