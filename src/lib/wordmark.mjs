/**
 * 单线字标「Yuuine」的几何 —— 和 logo.mjs 一样是全站唯一来源。
 *
 * 用 .mjs 而不是 .ts：scripts/build-brand.mjs 要直接 import 这份数据去生成分享卡，
 * 纯 ESM 在任意 Node 版本都能加载（类型剥离在 Node 22 上默认没开）。
 *
 * 消费方：
 *   src/views/home/Wordmark.tsx   首页内联渲染
 *   scripts/build-brand.mjs       派生 public/og.png
 *
 * 坐标：baseline 0、x-height 110、cap-height 152，向上为负。
 * 碗/拱用三次贝塞尔而非正圆弧 —— 底部更平、过渡更深，几何精确不等于好看。
 */

/** 碗深：竖线走到 -46 才转。比半圆浅，两侧的竖才读得出来 */
const BOWL_D = 46;
/** 笔画 / x-height = 19.1%。再加粗 e 的上字腔会先糊死 */
export const WORDMARK_STROKE = 21;
/** i 的竖线在自己那一格里的横坐标。上面那个点要对齐它，不能按字母格中心算 */
const I_STEM_X = 14;

const bowl = (x) =>
  `M ${x + 8} -110 V ${-BOWL_D} ` +
  `C ${x + 8} ${-BOWL_D + 25} ${x + 35} 0 ${x + 60} 0 ` +
  `C ${x + 85} 0 ${x + 112} ${-BOWL_D + 25} ${x + 112} ${-BOWL_D} V -110`;

const arch = (x) =>
  `M ${x + 8} 0 V -64 ` +
  `C ${x + 8} -96 ${x + 35} -110 ${x + 60} -110 ` +
  `C ${x + 85} -110 ${x + 112} -96 ${x + 112} -64 V 0`;

const capY = (x) =>
  `M ${x + 8} -152 L ${x + 58} -78 L ${x + 108} -152 M ${x + 58} -78 V 0`;

const lowercaseI = (x) => `M ${x + I_STEM_X} -110 V 0`;

/** e：整圈碗（3 点钟绕一整圈到 4:30 收笔，右下留口）+ 独立的腰线横杠。
 *  横杠不能当碗的起点 —— 那样碗只剩下半圈，读起来像杠盖在碗上 */
const lowercaseE = (x) =>
  `M ${x + 112} -55 A 55 55 0 1 0 ${x + 96} -16 M ${x + 2} -55 H ${x + 112}`;

const GLYPHS = {
  Y: capY,
  u: bowl,
  i: lowercaseI,
  n: arch,
  e: lowercaseE,
};

/** 逐字距：i 笔画细，两侧收紧，补掉它造成的空洞 */
const ADVANCE = { Y: 112, u: 112, i: 30, n: 112, e: 118 };
const GAPS = [14, 26, 16, 16, 26];

const WORD = 'Yuuine';

function build() {
  const letters = [];
  let cursor = 0;
  let tittleX = 0;

  [...WORD].forEach((char, idx) => {
    if (char === 'i') tittleX = cursor + I_STEM_X;
    letters.push(GLYPHS[char](cursor));
    cursor += ADVANCE[char] + (GAPS[idx] ?? 0);
  });

  return { letters, tittleX, width: cursor + 8 };
}

const { letters, tittleX, width } = build();

/** 六个字形的路径，按词序 */
export const WORDMARK_LETTERS = letters;
/** i 上面那个点是独立元素 —— 长在字形里就跳不起来 */
export const WORDMARK_DOT = { cx: tittleX, cy: -150, r: 13 };
export const WORDMARK_VIEW_BOX = `-10 -170 ${width + 20} 188`;
