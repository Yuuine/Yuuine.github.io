import { getDictionary, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';

/**
 * 关于页。
 *
 * <Placeholder> 标出的段落需要填入真实内容，填完替换成普通 <p>。
 */
function Placeholder({ tag, children }: { tag: string; children: React.ReactNode }) {
  return (
    <p className="placeholder">
      <span className="placeholder__tag">{tag}</span>
      {children}
    </p>
  );
}

export default function AboutView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const a = dict.about;

  return (
    <div className="container--text">
      <header className="page-head">
        <p className="eyebrow">{a.eyebrow}</p>
        <h1>{a.title}</h1>
      </header>

      <div className="prose">
        <p className="about__lead">{a.lead}</p>

        <h2>{a.doingTitle}</h2>
        <p>{a.doingBody}</p>

        <h2>{a.siteTitle}</h2>
        <p>{a.siteBody1}</p>
        <p>{a.siteBody2}</p>

        <h2>{a.expTitle}</h2>
        <Placeholder tag={a.placeholderTag}>{a.expNote}</Placeholder>

        <h2>{a.skillsTitle}</h2>
        <Placeholder tag={a.placeholderTag}>{a.skillsNote}</Placeholder>

        <h2>{a.contactTitle}</h2>
        <p>
          GitHub{' '}
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            @Yuuine
          </a>
        </p>
        <Placeholder tag={a.placeholderTag}>{a.contactNote}</Placeholder>
      </div>
    </div>
  );
}
