import type { Metadata } from 'next';
import { projects } from '@/data/projects';
import { buildMetadata } from '@/lib/seo';

export const metadata: Metadata = buildMetadata({
  path: '/projects/',
  title: '项目',
  description: '做过的项目与作品，包含技术选型、设计取舍和实现细节。',
});

export default function ProjectsPage() {
  const sorted = [...projects].sort((a, b) => b.year.localeCompare(a.year));

  return (
    <div className="container">
      <header className="page-head">
        <p className="eyebrow">Projects</p>
        <h1>项目</h1>
        <p className="lead">
          做过的东西，以及当时为什么这么选。数据在 <code>src/data/projects.ts</code>，
          加一条就多一个。
        </p>
      </header>

      {sorted.length === 0 ? (
        <p className="lead" style={{ paddingBottom: 'var(--sp-8)' }}>
          还没有录入项目。
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
                      线上地址 ↗
                    </a>
                  )}
                  {p.repo && (
                    <a href={p.repo} target="_blank" rel="noreferrer noopener">
                      源码 ↗
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
