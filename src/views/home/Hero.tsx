import { SITE } from '@/lib/site';
import CodeMosaic from './CodeMosaic';
import Wordmark from './Wordmark';

/**
 * 首页头屏：生成式代码马赛克 + 站点标识。
 *
 * 标题的真文字走视觉隐藏 span，字标 SVG 只是图形 —— 单线字形做不出可读的文本节点。
 */
export default function Hero() {
  return (
    <section className="hero">
      <CodeMosaic />
      <div className="hero__overlay">
        <h1 className="hero__title">
          <span className="visually-hidden">{SITE.title}</span>
          <Wordmark />
        </h1>
      </div>
      <div className="hero__scroll" aria-hidden="true">
        <span />
      </div>
    </section>
  );
}
