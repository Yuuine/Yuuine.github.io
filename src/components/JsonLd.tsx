/**
 * JSON-LD 的挂载点。
 *
 * 必须转义 `<`：文章标题里只要出现 `</script>`，这个标签就被提前截断了。
 */
export default function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
