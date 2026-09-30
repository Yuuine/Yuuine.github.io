/**
 * 项目 / 作品集数据。
 *
 * 加一个项目 = 往这个数组里加一条。字段都是可选的，缺省就不渲染那一行，
 * 不需要为了占位去填假数据。
 */
export interface Project {
  /** 项目名 */
  name: string;
  /** 一句话说明它解决什么问题 */
  summary: string;
  /** 详细一点的背景，可省略 */
  detail?: string;
  /** 技术栈标签 */
  stack: string[];
  /** 仓库地址 */
  repo?: string;
  /** 线上地址 */
  link?: string;
  /** 年份，用于排序和分组 */
  year: string;
  /** 是否在首页/列表里置顶 */
  featured?: boolean;
}

export const projects: Project[] = [
  {
    name: '本站（yuuine.cn）',
    summary: '从 Hexo 迁移到 Next.js 的个人站点，设计系统、内容管道、SEO 全部自建。',
    detail:
      '19 篇历史文章 1:1 保留原 URL 迁移，自研生成式代码马赛克首页，' +
      '明暗主题无闪烁切换，Shiki 双主题代码高亮，KaTeX 数学公式，静态导出部署。',
    stack: ['Next.js 16', 'TypeScript', 'React 19', 'Shiki', 'KaTeX'],
    link: 'https://www.yuuine.cn',
    year: '2026',
    featured: true,
  },
  // 下面保留一个模板，填好字段即可出现在列表里：
  // {
  //   name: '项目名',
  //   summary: '一句话说明它解决什么问题',
  //   detail: '背景、你负责的部分、有什么取舍',
  //   stack: ['Java', 'Spring Boot', 'MySQL'],
  //   repo: 'https://github.com/Yuuine/xxx',
  //   link: 'https://example.com',
  //   year: '2025',
  // },
];
