import { getAllArticles } from '@/lib/articles';
import { SITE } from '@/lib/site';

/**
 * Atom feed。
 *
 * 路径固定为 /atom.xml：订阅者阅读器里存的是这个地址，改路径等于作废全部订阅。
 */
export const dynamic = 'force-static';

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const articles = await getAllArticles();
  const updated = articles[0]?.date ?? new Date().toISOString();

  const entries = articles
    .map((a) => {
      const url = `${SITE.url}${a.permalink}`;
      return `  <entry>
    <title>${escapeXml(a.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${new Date(a.date).toISOString()}</updated>
    <summary>${escapeXml(a.description)}</summary>
${a.categories.map((c) => `    <category term="${escapeXml(c)}"/>`).join('\n')}
  </entry>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>${escapeXml(SITE.title)}</title>
  <subtitle>${escapeXml(SITE.description)}</subtitle>
  <link href="${SITE.url}/atom.xml" rel="self"/>
  <link href="${SITE.url}/"/>
  <id>${SITE.url}/</id>
  <updated>${new Date(updated).toISOString()}</updated>
  <author>
    <name>${escapeXml(SITE.author)}</name>
  </author>
${entries}
</feed>
`;

  return new Response(xml, {
    headers: { 'Content-Type': 'application/atom+xml; charset=utf-8' },
  });
}
