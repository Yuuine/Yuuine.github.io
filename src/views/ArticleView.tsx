import Link from 'next/link';
import 'katex/dist/katex.min.css';
import ArticleToc from '@/components/ArticleToc';
import BackToTop from '@/components/BackToTop';
import DiagramZoom from '@/components/DiagramZoom';
import JsonLd from '@/components/JsonLd';
import type { Article } from '@/lib/articles';
import { getRelatedArticles } from '@/lib/articles';
import { getReadingOrder } from '@/lib/docs';
import { formatDate } from '@/lib/format';
import { DEFAULT_LOCALE, getDictionary, localeHref, type Locale } from '@/lib/i18n';
import { renderMarkdown } from '@/lib/markdown';
import { blogPostingSchema } from '@/lib/schema';

/**
 * 文章正文目前只有中文。非默认语言下仍然生成同一个 URL 结构（/en/<文章>/），
 * 这样语言切换在文章页上不会失效，将来补译文也只是换掉 body，不用迁移 URL。
 * 正文是同一份，所以按语言给 canonical 会制造重复内容 —— 统一指向中文原文。
 */
export default async function ArticleView({
  article,
  locale,
}: {
  article: Article;
  locale: Locale;
}) {
  const dict = getDictionary(locale);
  const { html, toc } = await renderMarkdown(article.body);
  const order = await getReadingOrder(locale);
  const related = await getRelatedArticles(article);

  /**
   * 上下篇按左栏的阅读顺序走，不按时间轴。
   *
   * 左栏是"新 → 旧"自上而下、分类依次排开，索引页也是这个次序，所以"下一篇"就是
   * 往下数的那一篇 —— 走到本分类末尾自然进入下一分类的第一篇。按时间轴接的话，
   * 侧栏在上、按钮却指向另一个分类，同一页里指了两个方向。
   */
  const at = order.findIndex((entry) => entry.href === localeHref(locale, article.permalink));
  const previous = at > 0 ? order[at - 1] : undefined;
  const next = at >= 0 ? order[at + 1] : undefined;

  return (
    <article className={`article${toc.length ? ' article--with-toc' : ''}`}>
      <JsonLd data={blogPostingSchema(article)} />
      {/* 目录在 DOM 里排在正文前，键盘用户不必先翻完整篇才够得着它 */}
      {toc.length > 0 && <ArticleToc items={toc} label={dict.article.toc} />}

      <div className="article__main">
        <header className="article__header">
          <div className="article__meta">
            <time dateTime={article.date}>{formatDate(article.date)}</time>
            <span className="card__dot" />
            <span>{dict.common.minutes(article.minutes)}</span>
            <span className="card__dot" />
            {article.categories.map((c, i) => (
              <span key={c}>
                {i > 0 && ' / '}
                {/* 分类是主题入口：指向分类页，让每篇文章都有一条来自主题页的入站内链 */}
                <Link href={localeHref(locale, `/category/${c}/`)}>{dict.categories[c] ?? c}</Link>
              </span>
            ))}
          </div>
          <h1 className="article__title">{article.title}</h1>
          {article.description && <p className="article__desc">{article.description}</p>}

          {article.tags.length > 0 && (
            <ul className="article__tags">
              {article.tags.map((t) => (
                <li key={t}>#{t}</li>
              ))}
            </ul>
          )}
        </header>

        {locale !== DEFAULT_LOCALE && dict.article.translationNotice && (
          <p className="placeholder">{dict.article.translationNotice}</p>
        )}

        <div className="prose" dangerouslySetInnerHTML={{ __html: html }} />

        <DiagramZoom labels={dict.article.diagram} />

        <p className="article__updated">
          {dict.article.updated}{' '}
          <time dateTime={article.updated}>{formatDate(article.updated)}</time>
        </p>

        {/* 相关文章按共享标签自动算，不加 front-matter 字段，也不用人工维护 */}
        {related.length > 0 && (
          <aside className="article__related">
            <h2 className="article__related-title">{dict.article.related}</h2>
            <ul>
              {related.map((a) => (
                <li key={a.permalink}>
                  <Link href={localeHref(locale, a.permalink)}>{a.title}</Link>
                </li>
              ))}
            </ul>
          </aside>
        )}

        <nav className="article__nav" aria-label={dict.article.navAria}>
          {previous ? (
            <Link href={previous.href} className="article__nav-item">
              <span className="article__nav-label">{dict.article.prev}</span>
              <span className="article__nav-title">{previous.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link href={next.href} className="article__nav-item article__nav-item--next">
              <span className="article__nav-label">{dict.article.next}</span>
              <span className="article__nav-title">{next.title}</span>
            </Link>
          ) : (
            <span />
          )}
        </nav>

        <BackToTop label={dict.article.backToTop} />
      </div>
    </article>
  );
}
