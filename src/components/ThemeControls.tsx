'use client';

import { useEffect, useState } from 'react';

type Theme = 'light' | 'dark';
type Motion = 'on' | 'off';

/**
 * 把外观控制权交给访客 —— 明暗、动效。
 * 初始值由 layout 里的内联脚本在首次绘制前写好，这里只负责后续切换，
 * 避免水合闪烁。参考 alphanull.de 设置面板的做法。
 */
export default function ThemeControls() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [motion, setMotion] = useState<Motion | null>(null);
  const [open, setOpen] = useState(false);

  // 挂载后再读真实状态，服务端渲染不猜
  useEffect(() => {
    const root = document.documentElement;
    setTheme(root.classList.contains('is-dark-mode') ? 'dark' : 'light');
    setMotion(localStorage.getItem('motion') === 'off' ? 'off' : 'on');
  }, []);

  function applyTheme(next: Theme) {
    const root = document.documentElement;
    root.classList.toggle('is-dark-mode', next === 'dark');
    root.classList.toggle('is-light-mode', next === 'light');
    localStorage.setItem('theme', next);
    setTheme(next);
  }

  function applyMotion(next: Motion) {
    document.documentElement.classList.toggle('has-reduced-motion', next === 'off');
    localStorage.setItem('motion', next);
    setMotion(next);
  }

  return (
    <div className="controls">
      <button
        type="button"
        className="controls__trigger"
        aria-expanded={open}
        aria-label="外观设置"
        onClick={() => setOpen((v) => !v)}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
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

      {open && (
        <div className="controls__panel" role="group" aria-label="外观设置">
          <fieldset>
            <legend>主题</legend>
            <div className="controls__row">
              <button
                type="button"
                className={theme === 'light' ? 'is-active' : ''}
                onClick={() => applyTheme('light')}
              >
                浅色
              </button>
              <button
                type="button"
                className={theme === 'dark' ? 'is-active' : ''}
                onClick={() => applyTheme('dark')}
              >
                深色
              </button>
            </div>
          </fieldset>

          <fieldset>
            <legend>动效</legend>
            <div className="controls__row">
              <button
                type="button"
                className={motion === 'on' ? 'is-active' : ''}
                onClick={() => applyMotion('on')}
              >
                开启
              </button>
              <button
                type="button"
                className={motion === 'off' ? 'is-active' : ''}
                onClick={() => applyMotion('off')}
              >
                关闭
              </button>
            </div>
          </fieldset>
        </div>
      )}
    </div>
  );
}
