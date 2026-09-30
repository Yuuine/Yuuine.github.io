/**
 * 从 src/lib/logo.mjs 的单一源生成 public/ 下全部品牌资产。
 *
 * 存在的理由：public/ 无法引用 src/，logo 路径若手工复制到多个文件，
 * 改一处必漏一处。这里让四个产物全部从同一常量派生，消除漂移。
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
