/**
 * 从 src/lib/logo.mjs 的单一源生成 public/ 下全部品牌资产。
 *
 * 存在的理由：public/ 无法引用 src/，logo 路径若手工复制到多个文件，
 * 改一处必漏一处。这里让全部产物都从同一常量派生，消除漂移。
 *
 * 由 package.json 的 predev / prebuild 自动触发，无需手动执行。
 */
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import sharp from 'sharp';

import {
  BOX_LOOSE,
  BOX_TIGHT,
  INK,
  LOGO_PATH,
  PAPER,
} from '../src/lib/logo.mjs';
import {
  WORDMARK_DOT,
  WORDMARK_LETTERS,
  WORDMARK_STROKE,
  WORDMARK_VIEW_BOX,
} from '../src/lib/wordmark.mjs';

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PUBLIC = path.join(ROOT, 'public');

/** SVG 源文本。文件版不能用 currentColor —— <img> 加载时无 CSS 上下文，会退回黑色 */
const svgFile = (viewBox) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" role="img" aria-labelledby="t">
  <title id="t">Yuuine</title>
  <style>
    path { fill: ${INK}; }
    @media (prefers-color-scheme: dark) { path { fill: ${PAPER}; } }
  </style>
  <path d="${LOGO_PATH}"/>
</svg>
`;

/** iOS 主屏图标：系统会套自己的圆角遮罩，故留白更大且必须不透明 */
const appleTouchSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">
  <rect width="180" height="180" fill="${PAPER}"/>
  <g transform="translate(90 90) scale(0.62) translate(-128 -127.5)">
    <path fill="${INK}" d="${LOGO_PATH}"/>
  </g>
</svg>
`;

/**
 * 社交分享卡，1200×630 是各平台通用的 1.91:1。
 *
 * 卡片上不放任何文字：SVG 里的 <text> 由构建机的字体渲染，
 * 而 CI 的 Linux 镜像不保证有中文字体，会渲染成方块。
 * 这里用的是字标的路径数据，到哪都一样。
 */
const OG_W = 1200;
const OG_H = 630;
const OG_SCALE = 1.1;
/** 字标 viewBox 的中心，用来把它摆到卡片正中 */
const [wmX, wmY, wmW, wmH] = WORDMARK_VIEW_BOX.split(' ').map(Number);

const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${OG_W} ${OG_H}" width="${OG_W}" height="${OG_H}">
  <rect width="${OG_W}" height="${OG_H}" fill="${PAPER}"/>
  <g transform="translate(${OG_W / 2} ${OG_H / 2}) scale(${OG_SCALE}) translate(${-(wmX + wmW / 2)} ${-(wmY + wmH / 2)})">
    <g fill="none" stroke="${INK}" stroke-width="${WORDMARK_STROKE}" stroke-linecap="round" stroke-linejoin="round">
      ${WORDMARK_LETTERS.map((d) => `<path d="${d}"/>`).join('\n      ')}
    </g>
    <circle cx="${WORDMARK_DOT.cx}" cy="${WORDMARK_DOT.cy}" r="${WORDMARK_DOT.r}" fill="${INK}"/>
  </g>
</svg>
`;

/** 手写 ICO 容器：sharp 不产出多尺寸 ICO，而格式本身只是头部 + 目录 + PNG 数据块 */
function buildIco(frames) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(frames.length, 4);

  const directory = Buffer.alloc(16 * frames.length);
  let offset = header.length + directory.length;

  frames.forEach(({ size, data }, i) => {
    const at = i * 16;
    directory.writeUInt8(size >= 256 ? 0 : size, at);
    directory.writeUInt8(size >= 256 ? 0 : size, at + 1);
    directory.writeUInt8(0, at + 2); // 调色板数
    directory.writeUInt8(0, at + 3); // reserved
    directory.writeUInt16LE(1, at + 4); // 色彩平面
    directory.writeUInt16LE(32, at + 6); // 位深
    directory.writeUInt32LE(data.length, at + 8);
    directory.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, directory, ...frames.map((f) => f.data)]);
}

/** 内容一致就不落盘，保持 mtime 稳定，避免无谓地触发下游重建 */
async function writeIfChanged(file, data) {
  const next = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  try {
    const prev = await readFile(file, 'utf8');
    if (prev === next.toString('utf8')) return false;
  } catch {
    // 文件不存在，正常写入
  }
  await writeFile(file, next);
  return true;
}

const raster = (svg, size) =>
  sharp(Buffer.from(svg), { density: 384 }).resize(size, size).png().toBuffer();

const ICO_SIZES = [16, 32, 48, 64];

const faviconSvg = svgFile(BOX_TIGHT);

const planned = [
  ['logo.svg', svgFile(BOX_LOOSE)],
  ['favicon.svg', faviconSvg],
  [
    'favicon.ico',
    buildIco(
      await Promise.all(
        ICO_SIZES.map(async (size) => ({ size, data: await raster(faviconSvg, size) })),
      ),
    ),
  ],
  ['apple-touch-icon.png', await raster(appleTouchSvg, 180)],
  ['og.png', await sharp(Buffer.from(ogSvg)).png().toBuffer()],
];

const written = [];
for (const [name, data] of planned) {
  if (await writeIfChanged(path.join(PUBLIC, name), data)) written.push(name);
}

console.log(
  written.length
    ? `[brand] 已更新: ${written.join(', ')}`
    : '[brand] 全部为最新，无需写入',
);
