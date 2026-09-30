/**
 * 固定按东八区格式化。构建机时区可能不同，不固定会让同一篇文章
 * 在不同机器上渲染出不同日期。
 */
const dateFormatter = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  timeZone: 'Asia/Shanghai',
});

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso)).replace(/\//g, '-');
}
