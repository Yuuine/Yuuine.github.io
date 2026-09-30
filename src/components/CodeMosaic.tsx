import type { CSSProperties } from 'react';

/**
 * 生成式代码马赛克 —— 首页 Hero 的视觉主体。
 *
 * 网格密度与单格对比度需要克制：格子过大或颜色过浓会读成棋盘而非代码场，
 * 也会盖过前景标题。
 *
 * 必须用固定种子的 PRNG —— 随机值在服务端与客户端不一致会导致 hydration 报错。
 */

const FRAGMENTS = [
  'public static void main',
  '@SpringBootApplication',
  'synchronized (lock)',
  'CompletableFuture.supplyAsync',
  'Stream.of(1, 2, 3)',
  'ConcurrentHashMap',
  'ThreadPoolExecutor',
  'volatile boolean running',
  'ReentrantLock lock',
  'AtomicInteger counter',
  '@Transactional',
  '@RestController',
  '@McpTool(name = "search")',
  'CountDownLatch latch',
  'Optional.ofNullable',
  'record Point(int x, int y)',
  'instanceof String s',
  'List.of(a, b, c)',
  'Map.Entry<K, V>',
  '@FunctionalInterface',
  'wait() / notifyAll()',
  'Semaphore permits',
  'JSON-RPC 2.0',
  'tools/call',
  'embedding vector',
  'retrieval augmented',
  'chunk overlap',
  'SELECT ... FOR UPDATE',
  'EXPLAIN ANALYZE',
  'binlog / redo log',
  'docker compose up',
  'FROM eclipse-temurin:21',
  'git push origin main',
  'kubectl rollout status',
  'inverted index',
  'BM25 + rerank',
  'token budget',
  'context window',
  'prompt template',
  'agent loop',
  'data class',
  'O(log n)',
  'hash & (n - 1)',
  'CAS compareAndSwap',
  'happens-before',
  'AQS state',
  'ReadWriteLock',
  'ForkJoinPool',
  'ThreadLocal',
  'try-with-resources',
  'vector store',
  'cosine similarity',
  'top-k retrieve',
  'system prompt',
  'function calling',
  'streaming response',
];

/** mulberry32：小巧的确定性 PRNG，保证每次构建出的图案一致 */
function mulberry32(seed: number) {
  return function next() {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Props {
  /** 网格列数（PC 端）；窄屏由 CSS 降到 8 列 */
  cols?: number;
  rows?: number;
  seed?: number;
}

export default function CodeMosaic({ cols = 18, rows = 11, seed = 20260615 }: Props) {
  const rand = mulberry32(seed);
  const total = cols * rows;

  const tiles = Array.from({ length: total }, (_, i) => {
    const r = rand();

    // 四档色阶：a/b 为主色，c 为淡化，blank 留白制造呼吸。
    // 比例经过调整 —— 留白过多会变成棋盘，过少则糊成一片。
    const tone = r < 0.3 ? 'a' : r < 0.55 ? 'b' : r < 0.82 ? 'c' : 'blank';

    const text = tone === 'blank' ? '' : FRAGMENTS[Math.floor(rand() * FRAGMENTS.length)];

    // 单格透明度微抖动，制造纵深，避免整片色块齐平
    const opacity = 0.55 + rand() * 0.45;

    return { key: i, tone, text, opacity };
  });

  return (
    <div
      className="mosaic"
      style={{ '--cols': cols, '--rows': rows } as CSSProperties}
      aria-hidden="true"
    >
      {tiles.map((t) => (
        <span
          key={t.key}
          className={`mosaic__tile mosaic__tile--${t.tone}`}
          style={t.tone === 'blank' ? undefined : { opacity: t.opacity }}
        >
          {t.text}
        </span>
      ))}
    </div>
  );
}
