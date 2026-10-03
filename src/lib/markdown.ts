import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeKatex from 'rehype-katex';
import rehypeShiki from '@shikijs/rehype';
import rehypeStringify from 'rehype-stringify';

/** 最小 hast 节点形状，避免为了一个插件引入完整类型依赖 */
interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  value?: string;
  children?: HastNode[];
}

export interface TocItem {
  id: string;
  text: string;
}

/**
 * 把正文里的标题整体下移一级：h1→h2、h2→h3 …
 *
 * 文章页模板已用 <h1> 渲染标题，正文若自带 h1 会出现两个 h1。
 * 下移一级既保留作者的层级结构，又保证全页只有一个 h1。
 */
function rehypeDemoteHeadings() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && node.tagName && /^h[1-5]$/.test(node.tagName)) {
        const level = Number(node.tagName[1]) + 1;
        node.tagName = `h${level}`;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

/**
 * 收集正文里的目录。
 *
 * 只收「成组」的那一级，也就是标题数 ≥ 2 的最浅一级。因为正文开头常有一个孤零零的
 * 顶层标题（迁移遗留的文档标题，和模板渲染的 h1 重复），它不是章节；
 * 某一级只有一个标题时，它扮演的就是文档标题。
 *
 * 一篇长文的一级标题十几个、子标题五十多个，全列出来比正文还长，
 * 所以只取这一级，不往下展开。
 *
 * 必须排在 rehypeSlug 之后：锚点 id 是那里生成的，先收会拿到 undefined。
 */
function rehypeCollectToc(toc: TocItem[]) {
  return (tree: HastNode) => {
    const byDepth = new Map<number, TocItem[]>();

    const walk = (node: HastNode) => {
      const level = node.type === 'element' ? /^h([1-6])$/.exec(node.tagName ?? '') : null;
      const id = node.properties?.id;
      if (level && typeof id === 'string') {
        const depth = Number(level[1]);
        const list = byDepth.get(depth) ?? [];
        list.push({ id, text: nodeText(node) });
        byDepth.set(depth, list);
      }
      node.children?.forEach(walk);
    };
    walk(tree);

    const depth = [...byDepth.keys()].sort((a, b) => a - b).find((d) => byDepth.get(d)!.length > 1);
    if (depth !== undefined) toc.push(...byDepth.get(depth)!);
  };
}

/** 标题里可能嵌着 <code>、链接，取纯文本 */
function nodeText(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(nodeText).join('');
}

export interface RenderedMarkdown {
  html: string;
  /** 一级标题，按出现顺序。正文没有标题时为空数组 */
  toc: TocItem[];
}

/**
 * Markdown → HTML + 目录。
 *
 * 一次遍历同时产出两者：目录的 id 直接来自正文那份 hast，不二次解析 HTML，
 * 也就不存在「目录里的 id 和正文对不上」这种问题。
 *
 * 插件顺序不可随意调换：下移标题必须排在 rehypeSlug 之前，
 * 否则锚点 id 会按下移前的层级生成。
 */
export async function renderMarkdown(markdown: string): Promise<RenderedMarkdown> {
  const toc: TocItem[] = [];
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeDemoteHeadings)
    .use(rehypeSlug)
    .use(rehypeCollectToc, toc)
    .use(rehypeKatex)
    .use(rehypeShiki, {
      // 双主题：base.css 里用 .is-dark-mode 切换 --shiki-dark 系列变量
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return { html: String(file), toc };
}

/** 估算中文阅读时长（按 350 字/分钟） */
export function readingTime(markdown: string): number {
  const text = markdown.replace(/```[\s\S]*?```/g, '').replace(/[#>*`\-\[\]()]/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round((cjk + words * 1.5) / 350));
}
