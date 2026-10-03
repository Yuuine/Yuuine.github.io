'use client';

import { useEffect, useRef } from 'react';
import { startMosaicShuffle } from './mosaic-shuffle';

/**
 * 马赛克墙的动效驱动。
 *
 * 只挂一个锚点、自己渲染一个隐藏 span，是为了把那 198 块砖留在服务端 ——
 * 让 CodeMosaic 整个变成客户端组件的话，砖和那 56 条代码片段都要进客户端包，
 * 还要逐块 hydrate，而它们永远不会被 React 重新渲染（换块是直接改 DOM 的）。
 */
export default function MosaicShuffle() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = ref.current?.closest<HTMLElement>('.mosaic');
    // 减弱动态效果下整面墙就是一张静态图，这本来就是它该有的样子
    if (!root || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    return startMosaicShuffle(root);
  }, []);

  return <span ref={ref} hidden />;
}
