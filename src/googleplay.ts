/**
 * Client for Google Play's public, key-less web endpoints (the same ones the
 * play.google.com website and the google-play-scraper npm package use):
 *  - Reviews:  POST https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=UsvDTd
 *  - Details:  GET  https://play.google.com/store/apps/details?id={package}
 *  - Search:   GET  https://play.google.com/store/search?q={term}&c=apps
 *
 * These are undocumented. Responses are positional JSON arrays, so every field
 * is read defensively; if Google changes the layout we fail with a clear
 * upstream error instead of returning garbage.
 */
import { fetchText } from "./http.js";
import type { AppSummary, Review, ReviewFetchResult, ReviewSort } from "./itunes.js";
import { MAX_REVIEW_PAGES } from "./itunes.js";
import { UpstreamError, UserInputError } from "./util.js";

const SOURCE = "Google Play";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
/** Reviews per "page", kept equal to Apple's feed page size so `pages` means the same thing for both stores. */
const PAGE_SIZE = 50;
/** Max reviews Google returns per batchexecute call. */
const BATCH_SIZE = 150;

const PACKAGE_RE = /^[A-Za-z][A-Za-z0-9_]*(\.[A-Za-z0-9_]+)+$/;

/** True if `input` looks like a Play package name or a play.google.com app URL. */
export function looksLikePlayId(input: string | number): boolean {
  if (typeof input !== "string") return false;
  const s = input.trim();
  return /play\.google\.com\//i.test(s) || (PACKAGE_RE.test(s) && !/apple\.com/i.test(s));
}

/** Accepts a package name (com.instagram.android) or a play.google.com/store/apps/details?id=… URL. */
export function parsePlayAppId(input: string | number): string {
  const s = String(input).trim();
  if (PACKAGE_RE.test(s) && s.length <= 150) return s;
  const m = s.match(/[?&]id=([A-Za-z][A-Za-z0-9_]*(?:\.[A-Za-z0-9_]+)+)/);
  if (m) return m[1]!;
  throw new UserInputError(
    `Invalid Google Play app id "${input}". Use the package name (e.g. com.instagram.android) or a play.google.com/store/apps/details?id=… URL.`,
  );
}

type Json = unknown;
const at = (o: Json, ...path: number[]): Json =>
  path.reduce<Json>((a, k) => (Array.isArray(a) ? a[k] : undefined), o);
const str = (v: Json): string | null => (typeof v === "string" && v.length > 0 ? v : null);
const num = (v: Json): number | null => (typeof v === "number" && Number.isFinite(v) ? v : null);

// ---------------------------------------------------------------------------
// Reviews
// ---------------------------------------------------------------------------

const SORT_CODE: Record<ReviewSort, number> = { mosthelpful: 1, mostrecent: 2 };

function normalizeReview(r: Json, country: string): Review | null {
  const rating = num(at(r, 2));
  const id = str(at(r, 0));
  if (!id || !rating || rating < 1 || rating > 5) return null;
  const ts = num(at(r, 5, 0));
  const thumbs = num(at(r, 6)) ?? 0;
  return {
    id,
    author: str(at(r, 1, 0)) ?? "",
    rating,
    title: "",
    body: (str(at(r, 4)) ?? "").trim(),
    version: str(at(r, 10)),
    date: ts ? new Date(ts * 1000).toISOString() : null,
    voteSum: thumbs,
    voteCount: thumbs,
    country,
    developerReply: str(at(r, 7, 1)),
  };
}

async function fetchReviewBatch(
  appId: string,
  country: string,
  lang: string,
  sort: ReviewSort,
  count: number,
  token: string | null,
): Promise<{ reviews: Review[]; next: string | null }> {
  const inner = JSON.stringify([null, null, [2, SORT_CODE[sort], [count, null, token], null, []], [appId, 7]]);
  const freq = JSON.stringify([[["UsvDTd", inner, null, "generic"]]]);
  const url =
    `https://play.google.com/_/PlayStoreUi/data/batchexecute?rpcids=UsvDTd` +
    `&hl=${encodeURIComponent(lang)}&gl=${encodeURIComponent(country)}`;
  const text = await fetchText(url, {
    source: SOURCE,
    method: "POST",
    body: `f.req=${encodeURIComponent(freq)}`,
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8" },
    validate: (t) => t.startsWith(")]}'"),
  });
  let payload: Json;
  try {
    const outer = JSON.parse(text.replace(/^\)\]\}'\s*/, "")) as Json;
    const raw = str(at(outer, 0, 2));
    // Unknown packages answer with an empty payload rather than an HTTP error.
    if (!raw || raw === "[]") return { reviews: [], next: null };
    payload = JSON.parse(raw) as Json;
  } catch {
    throw new UpstreamError(`${SOURCE} returned an unrecognized reviews payload (format may have changed)`, 200, url);
  }
  const list = at(payload, 0);
  const reviews = Array.isArray(list)
    ? list.map((r) => normalizeReview(r, country)).filter((r): r is Review => r !== null)
    : [];
  return { reviews, next: str(at(payload, 1, 1)) };
}

/**
 * Fetch up to `pages` × 50 reviews (pages capped at 10, matching the Apple
 * tool's limits). Requests are sequential because each needs the previous
 * continuation token.
 */
export async function fetchPlayReviews(
  appId: string,
  country: string,
  lang: string,
  pages: number,
  sort: ReviewSort,
): Promise<ReviewFetchResult> {
  const pagesRequested = Math.min(pages, MAX_REVIEW_PAGES);
  const wanted = pagesRequested * PAGE_SIZE;
  const seen = new Set<string>();
  const reviews: Review[] = [];
  const errors: string[] = [];
  let token: string | null = null;
  while (reviews.length < wanted) {
    let batch: { reviews: Review[]; next: string | null };
    try {
      batch = await fetchReviewBatch(appId, country, lang, sort, Math.min(BATCH_SIZE, wanted - reviews.length), token);
    } catch (err) {
      if (reviews.length === 0) throw err;
      errors.push(`stopped after ${reviews.length} reviews: ${(err as Error).message}`);
      break;
    }
    for (const r of batch.reviews) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      reviews.push(r);
    }
    if (!batch.next || batch.reviews.length === 0) break;
    token = batch.next;
  }
  const kept = reviews.slice(0, wanted);
  return { reviews: kept, pagesRequested, pagesFetched: Math.ceil(kept.length / PAGE_SIZE), errors };
}

// ---------------------------------------------------------------------------
// App details / search (HTML pages carrying AF_initDataCallback JSON blobs)
// ---------------------------------------------------------------------------

function initDataBlobs(html: string): Json[] {
  const out: Json[] = [];
  const re = /AF_initDataCallback\(\{key: 'ds:\d+', hash: '[^']*', data:([\s\S]*?), sideChannel: \{\}\}\);<\/script>/g;
  for (let m = re.exec(html); m; m = re.exec(html)) {
    try {
      out.push(JSON.parse(m[1]!) as Json);
    } catch {
      /* skip blobs we cannot parse */
    }
  }
  return out;
}

const htmlToText = (s: string | null) =>
  s
    ? s
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
    : null;

const playUrl = (id: string) => `https://play.google.com/store/apps/details?id=${id}`;

/** Map the "app detail" array (ds:5 → [1][2] on detail pages, top result on search pages). */
function normalizeDetail(d: Json, id: string): AppSummary | null {
  const name = str(at(d, 0, 0));
  if (!name) return null;
  const micros = num(at(d, 57, 0, 0, 0, 0, 1, 0, 0));
  const updated = num(at(d, 145, 0, 1, 0));
  const released = str(at(d, 10, 0));
  const releasedDate = released ? new Date(`${released} UTC`) : null;
  return {
    id,
    name,
    developer: str(at(d, 68, 0)) ?? "",
    developerId: str(at(d, 68, 1, 4, 2))?.replace(/^.*[?&]id=/, "") ?? null,
    bundleId: id,
    genre: str(at(d, 79, 0, 0, 0)),
    price: micros !== null ? micros / 1e6 : null,
    formattedPrice: str(at(d, 57, 0, 0, 0, 0, 1, 0, 2)) ?? (micros === 0 ? "Free" : null),
    currency: str(at(d, 57, 0, 0, 0, 0, 1, 0, 1)),
    averageRating: num(at(d, 51, 0, 1)),
    ratingCount: num(at(d, 51, 2, 1)),
    currentVersionAverageRating: null,
    currentVersionRatingCount: null,
    // Often absent: many apps ship "Varies with device".
    version: str(at(d, 140, 0, 0, 0)),
    currentVersionReleaseDate: updated ? new Date(updated * 1000).toISOString() : null,
    releaseDate: releasedDate && !Number.isNaN(releasedDate.getTime()) ? releasedDate.toISOString() : null,
    contentRating: str(at(d, 9, 0)),
    sizeBytes: null,
    minimumOsVersion: null,
    url: playUrl(id),
    icon: str(at(d, 95, 0, 3, 2)),
    description: htmlToText(str(at(d, 72, 0, 1))),
    installs: str(at(d, 13, 0)),
  };
}

/** Look up one Play app. Returns null when the package does not exist in this storefront. */
export async function lookupPlayApp(appId: string, country: string, lang: string): Promise<AppSummary | null> {
  const url = `${playUrl(encodeURIComponent(appId))}&hl=${encodeURIComponent(lang)}&gl=${encodeURIComponent(country)}`;
  let html: string;
  try {
    html = await fetchText(url, { source: SOURCE, headers: { "User-Agent": BROWSER_UA } });
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) return null;
    throw err;
  }
  for (const blob of initDataBlobs(html)) {
    const d = at(blob, 1, 2);
    // Prefer blobs with a rating histogram (index 51). Some apps omit it (new/unrated or
    // truncated detail arrays); fall back when title + developer/installs are present.
    if (
      Array.isArray(d) &&
      typeof at(d, 0, 0) === "string" &&
      (Array.isArray(at(d, 51)) || typeof at(d, 68, 0) === "string" || typeof at(d, 13, 0) === "string")
    ) {
      return normalizeDetail(d, appId);
    }
  }
  throw new UpstreamError(`${SOURCE} app page for ${appId} had no recognizable app data (format may have changed)`, 200, url);
}

/** Collect search hits by shape rather than fixed paths, so minor layout shifts don't break search. */
function collectSearchHits(node: Json, out: Map<string, AppSummary>, depth = 0): void {
  if (!Array.isArray(node) || depth > 40) return;
  // Featured "top result" card: [.., .., detailArray, { "12": [[pkg, 7]], ... }]
  const meta = node[3];
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    const pkg = str(at((meta as Record<string, Json>)["12"], 0, 0));
    if (pkg && PACKAGE_RE.test(pkg) && !out.has(pkg)) {
      const app = normalizeDetail(node[2], pkg);
      if (app) out.set(pkg, app);
    }
  }
  // Regular list item: [[pkg, 7], icon, screenshots, title, [scoreText, score], genre, .., .., offer, .., .., .., .., [.., description], developer, installs]
  const head = node[0];
  if (Array.isArray(head) && head[1] === 7 && typeof head[0] === "string" && typeof node[3] === "string") {
    const pkg = head[0];
    if (PACKAGE_RE.test(pkg) && !out.has(pkg)) {
      const micros = num(at(node, 8, 1, 0, 0));
      out.set(pkg, {
        id: pkg,
        name: node[3],
        developer: str(node[14]) ?? "",
        developerId: null,
        bundleId: pkg,
        genre: str(node[5]),
        price: micros !== null ? micros / 1e6 : null,
        formattedPrice: str(at(node, 8, 1, 0, 2)) ?? (micros === 0 ? "Free" : null),
        currency: str(at(node, 8, 1, 0, 1)),
        averageRating: num(at(node, 4, 1)),
        ratingCount: null,
        currentVersionAverageRating: null,
        currentVersionRatingCount: null,
        version: null,
        currentVersionReleaseDate: null,
        releaseDate: null,
        contentRating: str(at(node, 24, 0)),
        sizeBytes: null,
        minimumOsVersion: null,
        url: playUrl(pkg),
        icon: str(at(node, 1, 3, 2)),
        description: htmlToText(str(at(node, 13, 1))),
        installs: str(node[15]),
      });
      return;
    }
  }
  for (const child of node) collectSearchHits(child, out, depth + 1);
}

export async function searchPlayApps(term: string, country: string, lang: string, limit: number): Promise<AppSummary[]> {
  const url = new URL("https://play.google.com/store/search");
  url.searchParams.set("q", term);
  url.searchParams.set("c", "apps");
  url.searchParams.set("hl", lang);
  url.searchParams.set("gl", country);
  const html = await fetchText(url.toString(), { source: SOURCE, headers: { "User-Agent": BROWSER_UA } });
  const hits = new Map<string, AppSummary>();
  for (const blob of initDataBlobs(html)) collectSearchHits(blob, hits);
  if (hits.size === 0 && /\/store\/apps\/details\?id=/.test(html)) {
    throw new UpstreamError(`${SOURCE} search page had app links but no recognizable app data (format may have changed)`, 200, url.toString());
  }
  return [...hits.values()].slice(0, limit);
}
