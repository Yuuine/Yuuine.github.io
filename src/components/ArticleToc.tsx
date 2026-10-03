'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import type { TocItem } from '@/lib/markdown';

/**
 * 判定线相对落点的余量。
 * 跳转把标题停在 scroll-margin-top 处，判定线如果也取这个值，落点差零点几像素
 * 就翻不过 `top <= line`，高亮会掉回上一个标题。
 */
const LINE_BIAS = 8;
/** 点击后的兜底解锁：用户一直不滚动也不该锁死 */
const LOCK_MAX = 5000;

/**
 * 文章目录。
 *
 * 高亮有两个来源：点击时立即定位，其余时候由滚动位置推算。滚动过程中不读布局 ——
 * 各标题的位置只在挂载、改窗口、正文尺寸变化时量一次，滚动时只做算术比较。
 */
export default function ArticleToc({ items, label }: { items: TocItem[]; label: string }) {
  const [open, setOpen] = useState(true);
  const [active, setActive] = useState(items[0]?.id ?? '');
  const ref = useRef<HTMLElement>(null);

  /** 点击之后锁住，直到用户自己动手滚动 */
  const locked = useRef(false);
  const timer = useRef(0);

  useEffect(() => {
    const tops = new Map<string, number>();
    /** 视口里"读到哪儿"的位置，取标题自己的 scroll-margin-top —— 跳转落点用的就是它 */
    let line = 0;
    let last = '';
    let raf = 0;

    const measure = () => {
      const anchor = document.querySelector('.prose [id]');
      const headerH = document.querySelector('.header')?.getBoundingClientRect().height ?? 0;
      const margin = anchor ? parseFloat(getComputedStyle(anchor).scrollMarginTop) : NaN;
      line = (Number.isFinite(margin) ? margin : headerH) + LINE_BIAS;

      for (const item of items) {
        const el = document.getElementById(item.id);
        if (el) tops.set(item.id, el.getBoundingClientRect().top + window.scrollY);
      }
    };

    const update = () => {
      raf = 0;
      if (locked.current) return;

      const y = window.scrollY + line;
      let current = items[0]?.id ?? '';
      for (const item of items) {
        const top = tops.get(item.id);
        if (top !== undefined && top <= y) current = item.id;
      }
      if (current !== last) {
        last = current;
        setActive(current);
      }
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    const onResize = () => {
      measure();
      update();
    };

    // 只有用户自己滚动才算离开点击定位：平滑滚动的 scroll 事件不算，
    // 否则一停稳，判定线的几像素误差就把高亮拽到隔壁标题上
    const unlock = () => {
      if (!locked.current) return;
      locked.current = false;
      clearTimeout(timer.current);
      update();
    };

    measure();
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('wheel', unlock, { passive: true });
    window.addEventListener('touchstart', unlock, { passive: true });
    window.addEventListener('keydown', unlock);

    // 正文尺寸会变（图片、字体、后续挂载的内容），变了就得重新量 ——
    // 用旧坐标推算，高亮会整体偏移
    const prose = document.querySelector('.prose');
    const ro = new ResizeObserver(() => {
      measure();
      update();
    });
    if (prose) ro.observe(prose);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('wheel', unlock);
      window.removeEventListener('touchstart', unlock);
      window.removeEventListener('keydown', unlock);
      ro.disconnect();
      clearTimeout(timer.current);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [items]);

  /**
   * 平滑滚动只挂在目录上，不用全局的 `html { scroll-behavior: smooth }`。
   * 全局那条会把 Next 自己的 scrollIntoView（路由切换后归零）也变成动画，
   * 而它的目标位置是按旧布局算的，结果就是页面停在半路 —— 之前踩过。
   */
  function jump(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);
    if (!target) return; // 找不到就把点击交回给浏览器，别把链接吞掉
    event.preventDefault();

    locked.current = true;
    clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      locked.current = false;
    }, LOCK_MAX);

    setActive(id);
    target.scrollIntoView({
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
      block: 'start',
    });
    history.pushState(null, '', `#${id}`);
  }

  return (
    <nav className="toc" aria-label={label} ref={ref}>
      <button
        type="button"
        className="toc__toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {label}
        <span className="toc__chevron" aria-hidden="true" />
      </button>

      {open && (
        <ol className="toc__list">
          {items.map((item) => {
            const current = item.id === active;
            return (
              <li key={item.id}>
                <a
                  className={`toc__link${current ? ' is-active' : ''}`}
                  href={`#${item.id}`}
                  aria-current={current ? 'location' : undefined}
                  onClick={(e) => jump(e, item.id)}
                >
                  {item.text}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
