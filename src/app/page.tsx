import type { Metadata } from 'next';
import Link from 'next/link';
import CodeMosaic from '@/components/CodeMosaic';
import { getAllArticles } from '@/lib/articles';
import { formatDate } from '@/lib/format';
import { buildMetadata } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = buildMetadata({
  path: '/',
  description: SITE.description,
});

export default async function Home() {
  const articles = await getAllArticles();
  const featured = articles.slice(0, 4);

  return (
    <>
      {/* Hero：生成式代码马赛克 + 站点标识 */}
      <section className="hero">
        <CodeMosaic />
        <div className="hero__overlay">
          <p className="hero__eyebrow">Java · 分布式 · AI</p>
          <h1 className="hero__title">{SITE.title}</h1>
          <p className="hero__subtitle">把弄明白的东西写下来</p>
          <div className="hero__actions">
            <Link className="btn" href="/articles/">
              读文章
            </Link>
            <Link className="btn btn--ghost" href="/projects/">
              看项目
            </Link>
          </div>
        </div>
        <div className="hero__scroll" aria-hidden="true">
          <span />
        </div>
      </section>

      <div className="container">
        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">Articles</p>
              <h2>最近写的</h2>
            </div>
            <Link className="section-title__more" href="/articles/">
              全部 {articles.length} 篇 →
            </Link>
          </div>

          <ul className="card-grid">
            {featured.map((a) => (
              <li key={a.permalink}>
                <Link className="card" href={a.permalink}>
                  <div className="card__meta">
                    <time dateTime={a.date}>{formatDate(a.date)}</time>
                    <span className="card__dot" />
                    <span>{a.categories.join(' / ')}</span>
                  </div>
                  <h3 className="card__title">{a.title}</h3>
                  <p className="card__desc">{a.description}</p>
                  <div className="card__foot">
                    <span>{a.minutes} 分钟</span>
                    <span className="card__tags">{a.tags.slice(0, 3).join(' · ')}</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="section">
          <div className="section-title">
            <div>
              <p className="eyebrow">About</p>
              <h2>关于这个站</h2>
            </div>
          </div>
          <p className="lead">
            这里放我写的东西——后端并发、分布式中间件、以及这两年在 AI 工程上的实践。
            站点的设计、代码和内容都在我的 GitHub 上。
          </p>
          <div className="hero__actions" style={{ marginTop: 'var(--sp-5)' }}>
            <Link className="btn btn--ghost" href="/about/">
              关于我
            </Link>
            <a
              className="btn btn--ghost"
              href={SITE.github}
              target="_blank"
              rel="noreferrer noopener"
            >
              源码
            </a>
          </div>
        </section>
      </div>
    </>
  );
}
