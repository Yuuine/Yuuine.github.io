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
  children?: HastNode[];
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
 * Markdown → HTML。
 *
 * 插件顺序不可随意调换：下移标题必须排在 rehypeSlug 之前，
 * 否则锚点 id 会按下移前的层级生成。
 */
export async function renderMarkdown(markdown: string): Promise<string> {
  const file = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkMath)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeDemoteHeadings)
    .use(rehypeSlug)
    .use(rehypeKatex)
    .use(rehypeShiki, {
      // 双主题：base.css 里用 .is-dark-mode 切换 --shiki-dark 系列变量
      themes: { light: 'github-light', dark: 'github-dark-dimmed' },
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(markdown);

  return String(file);
}

/** 估算中文阅读时长（按 350 字/分钟） */
export function readingTime(markdown: string): number {
  const text = markdown.replace(/```[\s\S]*?```/g, '').replace(/[#>*`\-\[\]()]/g, '');
  const cjk = (text.match(/[\u4e00-\u9fa5]/g) ?? []).length;
  const words = (text.match(/[A-Za-z0-9]+/g) ?? []).length;
  return Math.max(1, Math.round((cjk + words * 1.5) / 350));
}
