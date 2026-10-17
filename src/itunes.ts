/**
 * Client for Apple's public, key-less iTunes endpoints:
 *  - Search API:  https://itunes.apple.com/search?entity=software
 *  - Lookup API:  https://itunes.apple.com/lookup?id=...
 *  - Customer reviews RSS (JSON):
 *      https://itunes.apple.com/{country}/rss/customerreviews/page={n}/id={id}/sortby={sort}/json
 */
import { fetchText } from "./http.js";
import { UpstreamError, mapLimit } from "./util.js";

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
  /** Google Play only: install bucket such as "1,000,000+". */
  installs?: string | null;
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
  /** Google Play only: the developer's public reply, if any. */
  developerReply?: string | null;
}

const isJson = (text: string) => {
  try {
    JSON.parse(text);
    return true;
  } catch {
    // Apple occasionally returns an HTML error page with 200; treat as transient.
    return false;
  }
};

/** GET a JSON document from Apple with timeout, retry and caching. */
export async function fetchJson<T = unknown>(url: string): Promise<T> {
  const text = await fetchText(url, { source: "Apple API", headers: { Accept: "application/json" }, validate: isJson });
  return JSON.parse(text) as T;
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
  /** Pages that contributed at least one review. */
  pagesFetched: number;
  /** Apple only: pages that came back successfully but with no entries (the public feed drops pages at random). */
  emptyPages?: number;
  errors: string[];
}

const REVIEWS_PER_PAGE = 50;
const PAGE_CONCURRENCY = 3;

/**
 * Fetch up to `pages` pages of reviews. Pages are fetched with limited
 * concurrency. Apple's feed returns empty pages at random, so an empty page
 * does not end the feed: every non-empty page is kept. If the requested pages
 * yield fewer than half of pages*50 reviews, the remaining pages (up to
 * MAX_REVIEW_PAGES, so never more than 10 requests in total) are probed in
 * batches until the requested amount is reached; the result is capped at
 * pages*50 reviews. Per-page failures are collected rather than thrown unless
 * every requested page fails.
 */
export async function fetchReviews(
  appId: string,
  country: string,
  pages: number,
  sort: ReviewSort,
): Promise<ReviewFetchResult> {
  const requested = Math.min(pages, MAX_REVIEW_PAGES);
  const wanted = requested * REVIEWS_PER_PAGE;
  const fetchPage = async (p: number) => {
    try {
      return { page: p, reviews: await fetchReviewPage(appId, country, p, sort), error: null as string | null };
    } catch (err) {
      return { page: p, reviews: [] as Review[], error: `page ${p}: ${(err as Error).message}` };
    }
  };

  const results = await mapLimit(
    Array.from({ length: requested }, (_, i) => i + 1),
    PAGE_CONCURRENCY,
    fetchPage,
  );

  const errors = results.flatMap((r) => (r.error ? [r.error] : []));
  if (errors.length === results.length && results.length > 0) {
    throw new UpstreamError(`All review page requests failed for app ${appId} (${country}): ${errors[0]}`);
  }

  const total = () => results.reduce((s, r) => s + r.reviews.length, 0);
  if (total() < wanted / 2) {
    for (let next = requested + 1; next <= MAX_REVIEW_PAGES && total() < wanted; next += PAGE_CONCURRENCY) {
      const batch = [];
      for (let p = next; p < next + PAGE_CONCURRENCY && p <= MAX_REVIEW_PAGES; p++) batch.push(p);
      const probed = await mapLimit(batch, PAGE_CONCURRENCY, fetchPage);
      for (const r of probed) {
        if (r.error) errors.push(r.error);
        else results.push(r);
      }
    }
  }
  results.sort((a, b) => a.page - b.page);

  const seen = new Set<string>();
  const reviews: Review[] = [];
  let pagesFetched = 0;
  let emptyPages = 0;
  for (const r of results) {
    if (r.error) continue;
    if (r.reviews.length === 0) {
      emptyPages++;
      continue;
    }
    const before = reviews.length;
    for (const rev of r.reviews) {
      if (reviews.length >= wanted) break;
      const key = rev.id || `${rev.author}|${rev.date}|${rev.title}`;
      if (seen.has(key)) continue;
      seen.add(key);
      reviews.push(rev);
    }
    if (reviews.length > before) pagesFetched++;
  }
  return { reviews, pagesRequested: requested, pagesFetched, emptyPages, errors };
}
