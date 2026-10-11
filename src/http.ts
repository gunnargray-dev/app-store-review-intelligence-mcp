/** Shared HTTP client: timeout, retry (exponential backoff + jitter) and a small response cache. */
import { TtlCache, UpstreamError, sleep } from "./util.js";

const USER_AGENT = "app-review-intel-mcp/1.1 (+https://modelcontextprotocol.io)";
const TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS ?? 15_000);
const MAX_RETRIES = Number(process.env.HTTP_MAX_RETRIES ?? 2);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 5 * 60_000);

const cache = new TtlCache<string>(CACHE_TTL_MS, 500);

export function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

export interface FetchTextOptions {
  /** Human-readable upstream name used in error messages, e.g. "Apple API". */
  source: string;
  method?: "GET" | "POST";
  body?: string;
  headers?: Record<string, string>;
  /**
   * Return false to treat a 200 body as transient garbage (e.g. an HTML error
   * page where JSON was expected); the request is then retried.
   */
  validate?: (text: string) => boolean;
}

/** Fetch a text body with timeout, retries and caching (keyed by method + URL + body). */
export async function fetchText(url: string, opts: FetchTextOptions): Promise<string> {
  const method = opts.method ?? "GET";
  const key = `${method} ${url}\n${opts.body ?? ""}`;
  const cached = cache.get(key);
  if (cached !== undefined) return cached;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(400 * 2 ** (attempt - 1) + Math.random() * 250);
    try {
      const res = await fetch(url, {
        method,
        body: opts.body,
        headers: { "User-Agent": USER_AGENT, ...opts.headers },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        const err = new UpstreamError(`${opts.source} responded ${res.status} ${res.statusText}`, res.status, url);
        if (isRetryableStatus(res.status)) {
          lastErr = err;
          continue;
        }
        throw err;
      }
      const text = await res.text();
      if (opts.validate && !opts.validate(text)) {
        lastErr = new UpstreamError(`${opts.source} returned an unexpected response`, res.status, url);
        continue;
      }
      cache.set(key, text);
      return text;
    } catch (err) {
      if (err instanceof UpstreamError && err.status !== undefined && !isRetryableStatus(err.status)) throw err;
      const name = (err as { name?: string })?.name;
      lastErr =
        name === "TimeoutError" || name === "AbortError"
          ? new UpstreamError(`Request to ${opts.source} timed out after ${TIMEOUT_MS} ms`, undefined, url)
          : err;
    }
  }
  if (lastErr instanceof UpstreamError) throw lastErr;
  throw new UpstreamError(
    `Network error contacting ${opts.source}: ${String((lastErr as Error)?.message ?? lastErr)}`,
    undefined,
    url,
  );
}
