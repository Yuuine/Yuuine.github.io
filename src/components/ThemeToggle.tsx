'use client';

/**
 * 明暗切换。主题只写在 <html> 的 class 上（由 layout 的内联脚本在首次绘制前恢复），
 * 组件不持有状态 —— 服务端无法得知访客选了哪个主题，用 useState 必然首帧渲染错图标。
 * 两个图标都留在 DOM 里，显隐交给 CSS 按 class 判定。
 */
export default function ThemeToggle({ label }: { label: string }) {
  function apply() {
    const root = document.documentElement;
    const dark = root.classList.toggle('is-dark-mode');
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }

  function toggle() {
    // 不能用「逐元素颜色过渡」：color 是可继承属性，祖先一动整棵样式树每帧都要重算。
    // 实测本站 342 个元素下，哪怕只让 html/body 过渡也要 ~560ms 样式重算（无过渡时 5ms），
    // 无论怎么收窄选择器都救不回来。View Transitions 把这件事交给合成器，降到 ~80ms。
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced || typeof document.startViewTransition !== 'function') {
      apply();
      return;
    }
    document.startViewTransition(apply);
  }

  return (
    <button type="button" className="icon-btn" onClick={toggle} aria-label={label}>
      <svg className="icon-btn__moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
        />
      </svg>
      <svg className="icon-btn__sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        />
        <path
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4"
        />
      </svg>
    </button>
  );
}
