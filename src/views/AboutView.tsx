import { getDictionary, type Locale } from '@/lib/i18n';
import { SITE } from '@/lib/site';

/**
 * 关于页。
 *
 * 正文故意留空：这一页写的全是关于「我」的事实，只能本人写。摆一段看着像真的、
 * 其实是编的自我介绍，比空着更糟。要写就往下加，结构参照其它页的 .prose。
 */
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
        <p>
          GitHub{' '}
          <a href={SITE.github} target="_blank" rel="noreferrer noopener">
            @Yuuine
          </a>
        </p>
      </div>
    </div>
  );
}
