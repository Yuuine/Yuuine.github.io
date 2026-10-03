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
    summary: '个人技术站点，内容管道与设计系统全部自建，静态导出部署。',
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
