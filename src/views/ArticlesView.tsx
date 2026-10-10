import Link from 'next/link';
import { getDocsTree } from '@/lib/docs';
import { formatDate } from '@/lib/format';
import { getDictionary, type Locale } from '@/lib/i18n';

/**
 * 文章索引。表单来自文档树 —— 分类作分节，节内是链接列表，日期贴在行尾。
 * 这份树与左栏是同一份（见 lib/docs），所以索引与导航的次序不会各排各的。
 *
 * 页面上不出现标题：左栏的"全部文章"和浏览器标签已经说明了这是哪一页，
 * 再来一个通栏大标题只是把正文往下推。但 h1 不能省 —— 分节标题是 h2，
 * 少了 h1 标题层级就从 h2 起步了，所以留一份只给读屏和爬虫。
 */
export default async function ArticlesView({ locale }: { locale: Locale }) {
  const dict = getDictionary(locale);
  const groups = await getDocsTree(locale);

  return (
    <div className="doc-body">
      <h1 className="visually-hidden">{dict.articles.title}</h1>

      {groups.map((group) => (
        <section className="doc-section" key={group.name}>
          <h2 className="doc-section__title">
            {/* 分类是真路由，分节标题指向它，索引页因此成为分类页的第二个入站入口 */}
            <Link href={group.href}>{group.label}</Link>
          </h2>
          <ul className="doc-list">
            {group.articles.map((entry) => (
              <li key={entry.href}>
                <Link className="doc-list__link" href={entry.href}>
                  <span className="doc-list__title">{entry.title}</span>
                  <time className="doc-list__date" dateTime={entry.date}>
                    {formatDate(entry.date)}
                  </time>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
