import type { Metadata } from 'next';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  path: '/about/',
  title: '关于',
  description: '关于 Yuuine —— Java 后端方向的开发者，关注并发、分布式与 AI 工程。',
});

/**
 * 关于页。
 *
 * <Placeholder> 标出的段落需要填入真实内容，填完替换成普通 <p>。
 */
function Placeholder({ children }: { children: React.ReactNode }) {
  return (
    <p className="placeholder">
      <span className="placeholder__tag">待填</span>
      {children}
    </p>
  );
}

export default function AboutPage() {
  return (
    <div className="container--text">
      <header className="page-head">
        <p className="eyebrow">About</p>
        <h1>关于我</h1>
      </header>

      <div className="prose">
        <p className="about__lead">
          我是 {SITE.author}，写 Java，也写点前端。这个站是我的笔记本 —— 把弄明白的东西
          写下来，顺便当成一个可以随便折腾设计的地方。
        </p>

        <h2>在做什么</h2>
        <p>
          后端方向，日常和并发、JVM、MySQL、分布式中间件打交道。最近两年很大一部分精力
          在 AI 工程上：RAG 的检索链路、MCP 协议与工具生态。这个站的文章分类基本就是这个
          范围的映射 —— Java、分布式、SQL、AI。
        </p>

        <h2>这个站</h2>
        <p>
          2024 年建的，最初是 Hexo + Ayer 主题。2026 年做了一次彻底重构：换到 Next.js，
          设计系统和主题从零自己写，因为套用现成主题改到后面会一直在跟主题搏斗。
        </p>
        <p>
          技术上是静态导出，部署在 GitHub Pages，前面挂 Cloudflare。代码高亮用 Shiki
          双主题，公式走 KaTeX，19 篇历史文章保留了原来的 URL。
        </p>

        <h2>经历</h2>
        <Placeholder>
          这里放你的工作经历 —— 公司、职位、时间段、负责的系统。两三行一段，
          写清楚「做了什么」和「结果是什么」就够了，不用写成简历。
        </Placeholder>

        <h2>技能</h2>
        <Placeholder>
          这里放你愿意被认领的技术栈，建议按「熟练 / 用过」两档分，别全列成一样。
        </Placeholder>

        <h2>联系</h2>
        <p>
          GitHub：
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            @Yuuine
          </a>
        </p>
        <Placeholder>邮箱或其他联系方式。不想公开邮箱的话这一段直接删掉。</Placeholder>
      </div>
    </div>
  );
}
