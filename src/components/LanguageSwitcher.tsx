'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { LOCALES, getDictionary, localeHref, stripLocale, type Locale } from '@/lib/i18n';

/**
 * 语言下拉。基座用 <details>：开合是原生行为，无 JS 也能用，键盘可达，
 * 标签也留在 DOM 里而不是按状态渲染。
 *
 * 原生只在点 summary 时开合，点外部和按 Esc 都关不掉 —— 这两条是下拉的基本预期，
 * 用一段监听补上；菜单里点击后立即收起，否则客户端路由换了页面菜单还开着。
 *
 * href 由当前 pathname 剥掉语言前缀得到：在 /en/ai/mcp/x/ 上切到繁体，
 * 应该去 /zh-TW/ai/mcp/x/ 而不是回首页。
 */
export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const path = stripLocale(usePathname());
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      const el = ref.current;
      if (el?.open && !el.contains(e.target as Node)) el.open = false;
    }

    function onKeyDown(e: KeyboardEvent) {
      const el = ref.current;
      if (e.key !== 'Escape' || !el?.open) return;
      el.open = false;
      el.querySelector('summary')?.focus();
    }

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  return (
    <details className="lang" ref={ref}>
      <summary
        className="lang__trigger"
        aria-label={`${dict.header.language} — ${dict.localeShort}`}
      >
        {dict.localeShort}
        <svg className="lang__chevron" viewBox="0 0 16 16" width="12" height="12" aria-hidden="true">
          <path
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m4 6.5 4 4 4-4"
          />
        </svg>
      </summary>

      <ul
        className="lang__menu"
        onClick={() => {
          if (ref.current) ref.current.open = false;
        }}
      >
        {LOCALES.map((l) => (
          <li key={l}>
            <Link
              href={localeHref(l, path)}
              hrefLang={l}
              className={l === locale ? 'is-active' : undefined}
              aria-current={l === locale ? 'true' : undefined}
            >
              {getDictionary(l).localeName}
            </Link>
          </li>
        ))}
      </ul>
    </details>
  );
}
