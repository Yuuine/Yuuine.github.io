import { projects } from '@/data/projects';
import { getDictionary, type Locale } from '@/lib/i18n';

export default function ProjectsView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const sorted = [...projects].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">{dict.projects.eyebrow}</p>
        <h1>{dict.projects.title}</h1>
        <p className="lead">{dict.projects.lead}</p>
      </header>

      {sorted.length === 0 ? (
        <p className="lead" style={{ paddingBottom: 'var(--sp-8)' }}>
          {dict.projects.empty}
        </p>
      ) : (
        <ul className="project-list">
          {sorted.map((p) => (
            <li key={p.name} className="project">
              <div className="project__head">
                <h2 className="project__name">{p.name}</h2>
                <span className="project__year">{p.year}</span>
              </div>

              <p className="project__summary">{p.summary}</p>
              {p.detail && <p className="project__detail">{p.detail}</p>}

              <ul className="project__stack">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>

              {(p.repo || p.link) && (
                <div className="project__links">
                  {p.link && (
                    <a href={p.link} target="_blank" rel="noreferrer noopener">
                      {dict.projects.live}
                    </a>
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noreferrer noopener">
                      {dict.projects.repo}
                    </a>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
