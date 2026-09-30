import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import matter from 'gray-matter';
import { readingTime } from './markdown';

const CONTENT_DIR = join(process.cwd(), 'src/content/articles');

/** 必填字段。漏掉任何一个都直接让构建失败，而不是生成一个残缺页面 */
const REQUIRED_FIELDS = ['title', 'date', 'description', 'categories', 'tags', 'permalink'] as const;

/** permalink 必须形如 /ai/mcp/example/ */
const PERMALINK_PATTERN = /^\/[^\s]*\/$/;

export interface ArticleMeta {
  /** URL 路径，如 /ai/mcp/introduceMCP/ */
  permalink: string;
  /** 去掉首尾斜杠的 slug，供动态路由使用 */
  slug: string;
  title: string;
  date: string;
  description: string;
  categories: string[];
  tags: string[];
  math: boolean;
  minutes: number;
}

export interface Article extends ArticleMeta {
  body: string;
}

function toArray(value: unknown): string[] {
  return (Array.isArray(value) ? value : [value])
    .filter((v) => v !== undefined && v !== null && v !== '')
    .map((v) => String(v).trim());
}

/**
 * 校验 front-matter。
 *
 * 内容写错时在构建期失败，而不是渲染出标题为 "undefined" 的页面。
 */
function validate(fileName: string, data: Record<string, unknown>): void {
  const problems: string[] = [];

  for (const field of REQUIRED_FIELDS) {
    const value = data[field];
    if (value === undefined || value === null || value === '') {
      problems.push(`缺少必填字段 \`${field}\``);
    }
  }

  if (data.permalink !== undefined && !PERMALINK_PATTERN.test(String(data.permalink))) {
    problems.push(`\`permalink\` 必须以 / 开头和结尾，当前是 "${data.permalink}"`);
  }

  // 小写归一化：大小写不一致会让分类筛选对不上
  for (const field of ['categories', 'tags'] as const) {
    const values = toArray(data[field]);
    const bad = values.filter((v) => v !== v.toLowerCase());
    if (bad.length > 0) {
      problems.push(`\`${field}\` 必须全小写，当前有：[${bad.join(', ')}]`);
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `文章 front-matter 校验失败：src/content/articles/${fileName}\n` +
        problems.map((p) => `  - ${p}`).join('\n'),
    );
  }
}

function toMeta(data: Record<string, unknown>, body: string): ArticleMeta {
  const permalink = String(data.permalink);
  return {
    permalink,
    slug: permalink.replace(/^\/+|\/+$/g, ''),
    title: String(data.title),
    date: String(data.date),
    description: String(data.description ?? ''),
    categories: toArray(data.categories).map((c) => c.toLowerCase()),
    tags: toArray(data.tags).map((t) => t.toLowerCase()),
    math: Boolean(data.math),
    minutes: readingTime(body),
  };
}

let cache: Article[] | null = null;

/** 读取全部文章（构建期执行，结果进模块级缓存） */
export async function getAllArticles(): Promise<Article[]> {
  if (cache) return cache;

  const files = (await readdir(CONTENT_DIR)).filter((f) => f.endsWith('.md'));

  const articles = await Promise.all(
    files.map(async (fileName) => {
      const raw = await readFile(join(CONTENT_DIR, fileName), 'utf8');
      const { data, content } = matter(raw);
      validate(fileName, data as Record<string, unknown>);
      return { ...toMeta(data as Record<string, unknown>, content), body: content };
    }),
  );

  cache = articles.sort((a, b) => (a.date < b.date ? 1 : -1));
  return cache;
}

export async function getArticleBySlug(slug: string): Promise<Article | undefined> {
  const all = await getAllArticles();
  return all.find((a) => a.slug === slug);
}

/** 按分类聚合，供文章页筛选使用 */
export async function getCategoryCounts(): Promise<{ name: string; count: number }[]> {
  const all = await getAllArticles();
  const counts = new Map<string, number>();
  for (const a of all) {
    for (const c of a.categories) counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}
