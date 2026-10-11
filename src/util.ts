/** Small shared helpers: errors, caching, concurrency, input normalization. */

export class UserInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UserInputError";
  }
}

export class UpstreamError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly url?: string,
  ) {
    super(message);
    this.name = "UpstreamError";
  }
}

/** Tiny TTL + size-bounded cache (insertion-ordered eviction). */
export class TtlCache<V> {
  private readonly store = new Map<string, { value: V; expires: number }>();
  constructor(
    private readonly ttlMs: number,
    private readonly maxEntries: number,
  ) {}

  get(key: string): V | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (hit.expires < Date.now()) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value;
  }

  set(key: string, value: V): void {
    if (this.ttlMs <= 0) return;
    this.store.delete(key);
    this.store.set(key, { value, expires: Date.now() + this.ttlMs });
    while (this.store.size > this.maxEntries) {
      const oldest = this.store.keys().next().value;
      if (oldest === undefined) break;
      this.store.delete(oldest);
    }
  }
}

/** Run `fn` over `items` with at most `limit` in flight; preserves order. */
export async function mapLimit<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

export const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Accepts a numeric id (284882215), a numeric string, "id284882215",
 * or an App Store URL (https://apps.apple.com/us/app/facebook/id284882215).
 */
export function parseAppId(input: string | number): string {
  if (typeof input === "number") {
    if (Number.isSafeInteger(input) && input > 0) return String(input);
    throw new UserInputError(`Invalid app_id: ${input}`);
  }
  const s = input.trim();
  if (/^\d{3,15}$/.test(s)) return s;
  const m = s.match(/(?:^|\/|\b)id(\d{3,15})(?:\b|$)/i);
  if (m) return m[1]!;
  throw new UserInputError(
    `Invalid app_id "${input}". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.`,
  );
}

export function normalizeCountry(input: string): string {
  const c = input.trim().toLowerCase();
  if (!/^[a-z]{2}$/.test(c)) {
    throw new UserInputError(`Invalid country "${input}". Use a 2-letter ISO code such as "us", "gb", "de".`);
  }
  return c;
}

export function round(n: number, digits = 2): number {
  const f = 10 ** digits;
  return Math.round(n * f) / f;
}

export function truncate(s: string, max: number): string {
  const clean = s.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > max * 0.6 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
