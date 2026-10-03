import {
  WORDMARK_DOT,
  WORDMARK_LETTERS,
  WORDMARK_STROKE,
  WORDMARK_VIEW_BOX,
} from './wordmark-geometry';

/**
 * 首页字标。
 *
 * 可见的当图形，可读的交给搜索引擎和读屏：真正的文字由外层 <h1> 里的视觉隐藏 span 提供，
 * 这个 SVG 整体对辅助技术隐藏。
 */
export default function Wordmark() {
  return (
    <svg className="wordmark" viewBox={WORDMARK_VIEW_BOX} aria-hidden="true">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={WORDMARK_STROKE}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {WORDMARK_LETTERS.map((d, i) => (
          <path key={i} d={d} />
        ))}
      </g>

      <circle
        className="wordmark__tittle"
        cx={WORDMARK_DOT.cx}
        cy={WORDMARK_DOT.cy}
        r={WORDMARK_DOT.r}
      />
    </svg>
  );
}
