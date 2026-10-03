/**
 * 马赛克墙的滑动换块 —— 华容道那一套。
 *
 * 墙上有几块空格（tone 为 blank 的砖），空格在相邻格之间游走：邻格的砖滑进空格，
 * 空格就挪到那块砖原来的位置。于是整面墙一直在缓慢重排 —— 空格是不可见的，它可以瞬移，
 * 所以每一格只有一块砖需要真的动。
 *
 * 空格每一拍重新挑，不黏在原地：让一块空格一直随机游走的话，十几秒才扩散三四格，
 * 活动范围会缩在墙的一角。反正空格看不见，换一批等于让它瞬移，不要钱。
 *
 * 位置改的是 left/top（相对容器的百分比），动的是 transform：位置是跳变的，
 * 只有那一段 transform 在跑，所以每走一步只脏一块砖，不牵动布局里的其它 197 块。
 * 开销与每拍的块数、节拍频率成正比 —— 调 HOLES / SLIDE / REST 时要重新量。
 */

/** 每拍同时走几块 */
const HOLES = 5;
/** 滑动一格的时长（毫秒） */
const SLIDE = 1000;
/** 两次节拍之间的停顿（毫秒区间） */
const REST = [800, 1600];
/** 同拍几块之间至少隔几格，免得几块挤在一处 */
const SPREAD = 4;

interface Slot {
  el: HTMLElement;
  c: number;
  r: number;
  blank: boolean;
}

const key = (c: number, r: number) => `${c},${r}`;

export function startMosaicShuffle(root: HTMLElement): () => void {
  const slots: Slot[] = [...root.querySelectorAll<HTMLElement>('.mosaic__tile')].map((el) => ({
    el,
    c: Number(el.style.getPropertyValue('--c')),
    r: Number(el.style.getPropertyValue('--r')),
    blank: el.classList.contains('mosaic__tile--blank'),
  }));

  // 窄屏由 CSS 把 --cols 降到 8，露出来的是左边那几列 —— 边界得按当前网格算
  let cols = 0;
  let rows = 0;
  let cell = new Map<string, number>();

  const measure = () => {
    const style = getComputedStyle(root);
    cols = Number(style.getPropertyValue('--cols'));
    rows = Number(style.getPropertyValue('--rows'));
    cell = new Map();
    slots.forEach((slot, i) => {
      if (slot.c < cols && slot.r < rows) cell.set(key(slot.c, slot.r), i);
    });
  };

  const inside = (c: number, r: number) => c >= 0 && r >= 0 && c < cols && r < rows;

  /** 把邻格的砖拉进洞里，洞就挪到它原来的位置 */
  const step = (hole: number) => {
    const gap = slots[hole];
    const dirs: [number, number][] = [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ];
    dirs.sort(() => Math.random() - 0.5);

    for (const [dc, dr] of dirs) {
      const c = gap.c + dc;
      const r = gap.r + dr;
      if (!inside(c, r)) continue;
      const pick = cell.get(key(c, r));
      if (pick === undefined || slots[pick].blank) continue;

      const tile = slots[pick];
      const from = { c: tile.c, r: tile.r };
      cell.set(key(from.c, from.r), hole);
      cell.set(key(gap.c, gap.r), pick);
      tile.c = gap.c;
      tile.r = gap.r;
      gap.c = from.c;
      gap.r = from.r;

      tile.el.style.setProperty('--c', String(tile.c));
      tile.el.style.setProperty('--r', String(tile.r));
      gap.el.style.setProperty('--c', String(gap.c));
      gap.el.style.setProperty('--r', String(gap.r));

      // 起点写成旧格子相对新格子的偏移，随后滑回 0。动画结束不带 fill，
      // 元素自然落回 --c/--r 定下的位置
      tile.el.animate(
        [
          { transform: `translate(${(from.c - tile.c) * 100}%, ${(from.r - tile.r) * 100}%)` },
          { transform: 'translate(0, 0)' },
        ],
        { duration: SLIDE, easing: 'cubic-bezier(0.3, 0, 0.2, 1)' },
      );
      return true;
    }
    return false;
  };

  let timer = 0;
  let running = false;

  const stop = () => {
    running = false;
    clearTimeout(timer);
    timer = 0;
  };

  /** 从空格里挑几块，彼此隔开；隔不开就放宽，宁可挤一点也不能少给 */
  const pickHoles = () => {
    const pool = slots.flatMap((slot, i) =>
      slot.blank && inside(slot.c, slot.r) ? [{ c: slot.c, r: slot.r, i }] : [],
    );
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    const far: typeof pool = [];
    const near: typeof pool = [];
    for (const spot of pool) {
      if (far.length >= HOLES) break;
      const apart = far.every(
        (other) => Math.max(Math.abs(other.c - spot.c), Math.abs(other.r - spot.r)) >= SPREAD,
      );
      (apart ? far : near).push(spot);
    }
    return [...far, ...near].slice(0, HOLES).map((spot) => spot.i);
  };

  const beat = () => {
    pickHoles().forEach(step);
    timer = window.setTimeout(
      () => beat(),
      SLIDE + REST[0] + Math.random() * (REST[1] - REST[0]),
    );
  };

  const start = () => {
    stop();
    measure();
    running = true;
    beat();
  };

  // 头屏滚出视口就停 —— 首页会停在下面读文章，没必要让一面看不见的墙一直跑
  const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
    threshold: 0,
  });
  io.observe(root);

  // 换断点时红格数变了，边界跟着变，得按新网格重来
  const onResize = () => running && start();
  window.addEventListener('resize', onResize);

  return () => {
    stop();
    io.disconnect();
    window.removeEventListener('resize', onResize);
  };
}
