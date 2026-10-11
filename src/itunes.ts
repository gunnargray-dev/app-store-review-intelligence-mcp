/**
 * Client for Apple's public, key-less iTunes endpoints:
 *  - Search API:  https://itunes.apple.com/search?entity=software
 *  - Lookup API:  https://itunes.apple.com/lookup?id=...
 *  - Customer reviews RSS (JSON):
 *      https://itunes.apple.com/{country}/rss/customerreviews/page={n}/id={id}/sortby={sort}/json
 */
import { TtlCache, UpstreamError, mapLimit, sleep } from "./util.js";

const USER_AGENT = "app-review-intel-mcp/1.0 (+https://modelcontextprotocol.io)";
const TIMEOUT_MS = Number(process.env.HTTP_TIMEOUT_MS ?? 15_000);
const MAX_RETRIES = Number(process.env.HTTP_MAX_RETRIES ?? 2);
const CACHE_TTL_MS = Number(process.env.CACHE_TTL_MS ?? 5 * 60_000);

/** Apple serves at most 10 pages (≈50 reviews each) of the review feed. */
export const MAX_REVIEW_PAGES = 10;

export type ReviewSort = "mostrecent" | "mosthelpful";

export interface AppSummary {
  id: string;
  name: string;
  developer: string;
  developerId: string | null;
  bundleId: string | null;
  genre: string | null;
  price: number | null;
  formattedPrice: string | null;
  currency: string | null;
  averageRating: number | null;
  ratingCount: number | null;
  currentVersionAverageRating: number | null;
  currentVersionRatingCount: number | null;
  version: string | null;
  currentVersionReleaseDate: string | null;
  releaseDate: string | null;
  contentRating: string | null;
  sizeBytes: number | null;
  minimumOsVersion: string | null;
  url: string | null;
  icon: string | null;
  description: string | null;
}

export interface Review {
  id: string;
  author: string;
  rating: number;
  title: string;
  body: string;
  version: string | null;
  date: string | null;
  voteSum: number;
  voteCount: number;
  country: string;
}

const cache = new TtlCache<unknown>(CACHE_TTL_MS, 500);

function isRetryableStatus(status: number): boolean {
  return status === 408 || status === 425 || status === 429 || status >= 500;
}

/** GET a JSON document with timeout, retry (exponential backoff + jitter) and caching. */
export async function fetchJson<T = unknown>(url: string): Promise<T> {
  const cached = cache.get(url);
  if (cached !== undefined) return cached as T;

  let lastErr: unknown;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) await sleep(400 * 2 ** (attempt - 1) + Math.random() * 250);
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": USER_AGENT, Accept: "application/json" },
        signal: AbortSignal.timeout(TIMEOUT_MS),
      });
      if (!res.ok) {
        const err = new UpstreamError(`Apple API responded ${res.status} ${res.statusText}`, res.status, url);
        if (isRetryableStatus(res.status)) {
          lastErr = err;
          continue;
        }
        throw err;
      }
      const text = await res.text();
      let data: T;
      try {
        data = JSON.parse(text) as T;
      } catch {
        // Apple occasionally returns an HTML error page with 200; treat as transient.
        lastErr = new UpstreamError("Apple API returned a non-JSON response", res.status, url);
        continue;
      }
      cache.set(url, data);
      return data;
    } catch (err) {
      if (err instanceof UpstreamError && err.status !== undefined && !isRetryableStatus(err.status)) throw err;
      const name = (err as { name?: string })?.name;
      lastErr =
        name === "TimeoutError" || name === "AbortError"
          ? new UpstreamError(`Request to Apple timed out after ${TIMEOUT_MS} ms`, undefined, url)
          : err;
    }
  }
  if (lastErr instanceof UpstreamError) throw lastErr;
  throw new UpstreamError(`Network error contacting Apple: ${String((lastErr as Error)?.message ?? lastErr)}`, undefined, url);
}

// ---------------------------------------------------------------------------
// Search / lookup
// ---------------------------------------------------------------------------

type RawApp = Record<string, unknown>;

const str = (v: unknown): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const num = (v: unknown): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

function normalizeApp(r: RawApp): AppSummary {
  const size = str(r.fileSizeBytes);
  return {
    id: String(r.trackId),
    name: str(r.trackName) ?? "",
    developer: str(r.sellerName) ?? str(r.artistName) ?? "",
    developerId: r.artistId != null ? String(r.artistId) : null,
    bundleId: str(r.bundleId),
    genre: str(r.primaryGenreName),
    price: num(r.price),
    formattedPrice: str(r.formattedPrice),
    currency: str(r.currency),
    averageRating: num(r.averageUserRating),
    ratingCount: num(r.userRatingCount),
    currentVersionAverageRating: num(r.averageUserRatingForCurrentVersion),
    currentVersionRatingCount: num(r.userRatingCountForCurrentVersion),
    version: str(r.version),
    currentVersionReleaseDate: str(r.currentVersionReleaseDate),
    releaseDate: str(r.releaseDate),
    contentRating: str(r.trackContentRating) ?? str(r.contentAdvisoryRating),
    sizeBytes: size && /^\d+$/.test(size) ? Number(size) : null,
    minimumOsVersion: str(r.minimumOsVersion),
    url: str(r.trackViewUrl)?.replace(/\?.*$/, "") ?? null,
    icon: str(r.artworkUrl512) ?? str(r.artworkUrl100),
    description: str(r.description),
  };
}

export async function searchApps(term: string, country: string, limit: number): Promise<AppSummary[]> {
  const url = new URL("https://itunes.apple.com/search");
  url.searchParams.set("term", term);
  url.searchParams.set("country", country);
  url.searchParams.set("entity", "software");
  url.searchParams.set("media", "software");
  url.searchParams.set("limit", String(limit));
  const data = await fetchJson<{ results?: RawApp[] }>(url.toString());
  return (data.results ?? []).filter((r) => r.trackId != null).map(normalizeApp);
}

/** Look up one or more apps by id. Missing apps are simply absent from the map. */
export async function lookupApps(ids: string[], country: string): Promise<Map<string, AppSummary>> {
  const url = new URL("https://itunes.apple.com/lookup");
  url.searchParams.set("id", ids.join(","));
  url.searchParams.set("country", country);
  url.searchParams.set("entity", "software");
  const data = await fetchJson<{ results?: RawApp[] }>(url.toString());
  const out = new Map<string, AppSummary>();
  for (const r of data.results ?? []) {
    if (r.trackId != null && (r.wrapperType === "software" || r.kind === "software" || r.trackName)) {
      const app = normalizeApp(r);
      out.set(app.id, app);
    }
  }
  return out;
}

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

type Label = { label?: string } | undefined;
type RawEntry = Record<string, unknown>;

const label = (v: unknown): string => {
  const l = (v as Label)?.label;
  return typeof l === "string" ? l : "";
};

function normalizeReview(e: RawEntry, country: string): Review | null {
  const ratingStr = label(e["im:rating"]);
  const rating = Number(ratingStr);
  // The first entry of older feeds describes the app itself and has no rating.
  if (!ratingStr || !Number.isInteger(rating) || rating < 1 || rating > 5) return null;
  const author = (e.author as { name?: Label } | undefined)?.name;
  return {
    id: label(e.id),
    author: label(author),
    rating,
    title: label(e.title).trim(),
    body: label(e.content).trim(),
    version: label(e["im:version"]) || null,
    date: label(e.updated) || null,
    voteSum: Number(label(e["im:voteSum"])) || 0,
    voteCount: Number(label(e["im:voteCount"])) || 0,
    country,
  };
}

export async function fetchReviewPage(
  appId: string,
  country: string,
  page: number,
  sort: ReviewSort,
): Promise<Review[]> {
  const url = `https://itunes.apple.com/${country}/rss/customerreviews/page=${page}/id=${appId}/sortby=${sort}/json`;
  let data: { feed?: { entry?: RawEntry | RawEntry[] } };
  try {
    data = await fetchJson(url);
  } catch (err) {
    // Apple answers 400/404 for pages beyond the end or unknown storefront/app combos.
    if (err instanceof UpstreamError && (err.status === 400 || err.status === 404)) return [];
    throw err;
  }
  const entry = data.feed?.entry;
  const entries = Array.isArray(entry) ? entry : entry ? [entry] : [];
  return entries.map((e) => normalizeReview(e, country)).filter((r): r is Review => r !== null);
}

export interface ReviewFetchResult {
  reviews: Review[];
  pagesRequested: number;
  pagesFetched: number;
  errors: string[];
}

/**
 * Fetch up to `pages` pages of reviews. Pages are fetched with limited
 * concurrency; once an empty page is seen, later pages are dropped (the feed
 * is exhausted). Per-page failures are collected rather than thrown unless
 * every page fails.
 */
export async function fetchReviews(
  appId: string,
  country: string,
  pages: number,
  sort: ReviewSort,
): Promise<ReviewFetchResult> {
  const pageNums = Array.from({ length: Math.min(pages, MAX_REVIEW_PAGES) }, (_, i) => i + 1);
  const results = await mapLimit(pageNums, 3, async (p) => {
    try {
      return { page: p, reviews: await fetchReviewPage(appId, country, p, sort), error: null as string | null };
    } catch (err) {
      return { page: p, reviews: [] as Review[], error: `page ${p}: ${(err as Error).message}` };
    }
  });

  const errors = results.flatMap((r) => (r.error ? [r.error] : []));
  if (errors.length === results.length && results.length > 0) {
    throw new UpstreamError(`All review page requests failed for app ${appId} (${country}): ${errors[0]}`);
  }

  const seen = new Set<string>();
  const reviews: Review[] = [];
  let pagesFetched = 0;
  for (const r of results) {
    if (!r.error && r.reviews.length === 0) break; // end of feed
    if (!r.error) pagesFetched++;
    for (const rev of r.reviews) {
      const key = rev.id || `${rev.author}|${rev.date}|${rev.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      reviews.push(rev);
    }
  }
  return { reviews, pagesRequested: pageNums.length, pagesFetched, errors };
}
