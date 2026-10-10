'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useSyncExternalStore } from 'react';
import type { DocsGroup } from '@/lib/docs';

/** 与 SiteChrome 的预绘制脚本共用这个键，两边写错一个字符收起状态就恢复不了 */
const STORAGE_KEY = 'docs-nav';

/** 结尾斜杠在首屏 HTML 与客户端跳转两条路径上不保证一致，比较前统一削掉 */
function normalize(path: string): string {
  return path.length > 1 && path.endsWith('/') ? path.slice(0, -1) : path;
}

/**
 * 收起状态的真身在 <html data-nav> 上，不在这里。
 *
 * 它必须早于首次绘制就生效（预绘制脚本写、CSS 直接读），把这个时序抄进 React
 * state 只能靠 effect 补一次同步，那是一次多余的级联渲染，还会让 aria-expanded
 * 与画面短暂相反。所以这里按"外部存储"订阅它，值始终从 DOM 现读。
 */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-nav'],
  });
  return () => observer.disconnect();
}

function getSnapshot() {
  return document.documentElement.dataset.nav !== 'collapsed';
}

/** 构建期没有 document，缺省即展开 —— 与不带 data-nav 的静态 HTML 一致 */
function getServerSnapshot() {
  return true;
}

/**
 * 文章区的左栏。
 */
export default function DocsNav({
  groups,
  indexHref,
  indexLabel,
  navLabel,
  toggleLabel,
}: {
  groups: DocsGroup[];
  indexHref: string;
  indexLabel: string;
  navLabel: string;
  toggleLabel: string;
}) {
  const pathname = normalize(usePathname());
  const open = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  /**
   * 分组一律默认收起，状态只在内存里 —— 不落 localStorage 是因为落盘就得在预绘制
   * 阶段一并恢复，否则静态 HTML 先画出一堆展开的分组、hydration 后再折起来，会跳一下。
   * 跨页跳转不会丢：它挂在 layout 上，不随页面重建。
   */
  const [overrides, setOverrides] = useState<Readonly<Record<string, boolean>>>({});
  /** 收起状态下左栏看不出你在哪，所以当前页所在的那一组要把标签标出来 */
  const currentGroup = groups.find((g) =>
    g.articles.some((entry) => normalize(entry.href) === pathname),
  )?.name;

  function isExpanded(name: string) {
    return overrides[name] ?? false;
  }

  function toggleGroup(name: string) {
    const next = !isExpanded(name);
    setOverrides((prev) => ({ ...prev, [name]: next }));
  }

  function toggle() {
    const root = document.documentElement;
    if (open) root.dataset.nav = 'collapsed';
    else delete root.dataset.nav;
    try {
      localStorage.setItem(STORAGE_KEY, open ? 'collapsed' : 'open');
    } catch {}
  }

  const indexActive = pathname === normalize(indexHref);

  return (
    <nav className="docs-nav" aria-label={navLabel}>
      <button type="button" className="collapse-toggle" aria-expanded={open} onClick={toggle}>
        {toggleLabel}
        <span className="caret" aria-hidden="true" />
      </button>

      <div className="docs-nav__tree">
        <Link
          className={`docs-nav__index${indexActive ? ' is-active' : ''}`}
          href={indexHref}
          aria-current={indexActive ? 'page' : undefined}
        >
          {indexLabel}
        </Link>

        {groups.map((group) => {
          const expanded = isExpanded(group.name);
          return (
            <section className="docs-nav__group" key={group.name}>
              <button
                type="button"
                className={`docs-nav__label${group.name === currentGroup ? ' is-current' : ''}`}
                aria-expanded={expanded}
                onClick={() => toggleGroup(group.name)}
              >
                {group.label}
                <span className="caret" aria-hidden="true" />
              </button>

              {expanded && (
                <ul className="docs-nav__list">
                  {group.articles.map((entry) => {
                    const active = pathname === normalize(entry.href);
                    return (
                      <li key={entry.href}>
                        <Link
                          className={`docs-nav__link${active ? ' is-active' : ''}`}
                          href={entry.href}
                          aria-current={active ? 'page' : undefined}
                        >
                          {entry.title}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </nav>
  );
}
