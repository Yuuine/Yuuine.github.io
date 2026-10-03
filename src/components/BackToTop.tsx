'use client';

import { useEffect, useRef } from 'react';

/**
 * 回到顶部。
 *
 * 滚过一屏才出现 —— 短文章里它只会挡着正文。
 * 显示与否直接改 class，不走 React state：滚动是每帧都在发生的事，
 * 为此重渲染组件是白扔钱。
 */
export default function BackToTop({ label }: { label: string }) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const button = ref.current;
    if (!button) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      button.classList.toggle('is-visible', window.scrollY > window.innerHeight);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <button
      ref={ref}
      type="button"
      className="to-top"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
        })
      }
    >
      {label}
    </button>
  );
}
