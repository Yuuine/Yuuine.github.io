'use client';

import { useEffect, useRef } from 'react';

/** 每次点击的缩放倍率，以及上下限（百分比） */
const STEP = 1.25;
const MIN = 50;
const MAX = 400;

/**
 * 给正文里的 Mermaid 图加放大缩小。
 *
 * 图是构建期生成的静态 SVG，进不了 React 树，所以按 MosaicShuffle 那套办法：
 * 组件挂在叶子上，自己去 DOM 里找图。
 *
 * 缩放改的是 SVG 的宽高，不是 transform —— transform 不占布局，
 * 放大之后会直接盖住后面的正文。工具条悬浮在图上，改尺寸也不会引起页面跳动。
 */
export default function DiagramZoom({
  labels,
}: {
  labels: { zoomIn: string; zoomOut: string; reset: string };
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.closest('.article');
    if (!root) return;

    const cleanups: (() => void)[] = [];

    for (const box of Array.from(root.querySelectorAll<HTMLElement>('.diagram'))) {
      const svg = box.querySelector('svg');
      const scroller = box.querySelector<HTMLElement>('.diagram__scroll');
      if (!svg || !scroller) continue;

      const naturalWidth = Number(svg.getAttribute('width'));
      const naturalHeight = Number(svg.getAttribute('height'));
      if (!Number.isFinite(naturalWidth) || !Number.isFinite(naturalHeight)) continue;
      if (naturalWidth <= 0 || naturalHeight <= 0) continue;

      let percent = 100;

      const tools = document.createElement('div');
      tools.className = 'diagram__tools';

      const button = (label: string, text: string, onClick: () => void) => {
        const el = document.createElement('button');
        el.type = 'button';
        el.className = 'diagram__btn';
        el.setAttribute('aria-label', label);
        el.textContent = text;
        el.addEventListener('click', onClick);
        return el;
      };

      const out = button(labels.zoomOut, '−', () => set(percent / STEP));
      const level = button(labels.reset, '100%', () => set(100));
      const into = button(labels.zoomIn, '+', () => set(percent * STEP));

      /**
       * 缩放后把原来的视线中心留在原处。
       * 不这么做的话，横向滚到一半时一放大，看到的内容会整个跳走。
       */
      const set = (next: number) => {
        const clamped = Math.round(Math.min(MAX, Math.max(MIN, next)));
        if (clamped === percent) return;

        const before = scroller.scrollWidth;
        const center = scroller.scrollLeft + scroller.clientWidth / 2;

        percent = clamped;
        svg.style.width = `${Math.round((naturalWidth * percent) / 100)}px`;
        svg.style.height = `${Math.round((naturalHeight * percent) / 100)}px`;
        level.textContent = `${percent}%`;

        out.disabled = percent <= MIN;
        into.disabled = percent >= MAX;
        level.disabled = percent === 100;

        if (before > 0) {
          const ratio = scroller.scrollWidth / before;
          scroller.scrollLeft = center * ratio - scroller.clientWidth / 2;
        }
      };

      out.disabled = false;
      level.disabled = true;

      tools.append(out, level, into);
      box.append(tools);
      cleanups.push(() => tools.remove());
    }

    return () => cleanups.forEach((fn) => fn());
  }, [labels]);

  return <span ref={ref} hidden />;
}
