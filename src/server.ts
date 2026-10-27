import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BillingEvents, chargeEvent } from "./billing.js";
import { fetchPlayReviews, looksLikePlayId, lookupPlayApp, parsePlayAppId, searchPlayApps } from "./googleplay.js";
import {
  type AppSummary,
  type Review,
  type ReviewFetchResult,
  type ReviewSort,
  MAX_REVIEW_PAGES,
  fetchReviews,
  lookupApps,
  searchApps,
} from "./itunes.js";
import {
  nameStopwords,
  ratingByVersion,
  ratingDistribution,
  sampleQuotes,
  topKeywords,
  versionDeltas,
} from "./insights.js";
import {
  UpstreamError,
  UserInputError,
  errorMessage,
  mapLimit,
  normalizeCountry,
  parseAppId,
  round,
  truncate,
} from "./util.js";

export const SERVER_NAME = "app-review-intel-mcp";
export const SERVER_VERSION = "1.1.0";

type Store = "apple" | "google";

/**
 * Google Play support can be switched off with GOOGLE_PLAY_ENABLED=false (set in the
 * Apify Dockerfile until play-* events are priced). When off, tool schemas and
 * descriptions are App Store only and Google Play ids get a clear error.
 */
export function googlePlayEnabled(): boolean {
  return !/^(false|0|no|off)$/i.test((process.env.GOOGLE_PLAY_ENABLED ?? "").trim());
}

export const GOOGLE_PLAY_DISABLED_MESSAGE =
  "Google Play support is coming soon on the hosted version; use the open-source local server " +
  "(https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.";

// ---------------------------------------------------------------------------
// Shared input schemas
// ---------------------------------------------------------------------------

const appIdSchema = (play: boolean) =>
  z
    .union([z.number().int().positive(), z.string().min(1).max(300)])
    .describe(
      play
        ? 'App to analyse. Apple: numeric id (284882215), "id284882215" or an apps.apple.com URL. ' +
            "Google Play: package name (com.instagram.android) or a play.google.com URL. Get ids from search_apps."
        : 'App Store app to analyse: numeric id (284882215), "id284882215" or an apps.apple.com URL. Get ids from search_apps.',
    );

const storeSchema = (play: boolean) =>
  play
    ? z
        .enum(["apple", "google"])
        .optional()
        .describe('"apple" (App Store) or "google" (Google Play). Optional: inferred from app_id (numeric → apple, package name → google).')
    : z
        .enum(["apple"], { error: GOOGLE_PLAY_DISABLED_MESSAGE })
        .optional()
        .describe('Optional. Only "apple" (App Store) is available.');

const countrySchema = z
  .string()
  .regex(/^[A-Za-z]{2}$/, "must be a 2-letter ISO country code")
  .default("us")
  .describe('2-letter storefront country code, e.g. "us", "gb", "de". Default "us".');

const langSchema = z
  .string()
  .regex(/^[A-Za-z]{2,3}([-_][A-Za-z]{2,4})?$/, "must be a language code such as en, de or pt-BR")
  .default("en")
  .describe('Google Play only: review/listing language, e.g. "en", "de", "pt-BR". Default "en". Ignored for Apple.');

const pagesSchema = (def: number) =>
  z
    .number()
    .int()
    .min(1)
    .max(MAX_REVIEW_PAGES)
    .default(def)
    .describe(`Review pages to fetch, ~50 newest reviews each (1-${MAX_REVIEW_PAGES}). Default ${def}.`);

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;

/** Work out which store an app id belongs to (explicit `store` wins) and normalize the id. */
function resolveApp(input: string | number, store?: Store): { store: Store; id: string } {
  if (!googlePlayEnabled() && (store === "google" || looksLikePlayId(input))) {
    throw new UserInputError(GOOGLE_PLAY_DISABLED_MESSAGE);
  }
  if (store === "google" || (!store && looksLikePlayId(input))) return { store: "google", id: parsePlayAppId(input) };
  try {
    return { store: "apple", id: parseAppId(input) };
  } catch (err) {
    if (looksLikePlayId(input)) {
      throw new UserInputError(`"${input}" looks like a Google Play package name; use store "google" (or omit store).`);
    }
    throw err;
  }
}

function loadReviews(
  app: { store: Store; id: string },
  country: string,
  pages: number,
  sort: ReviewSort,
  lang: string,
): Promise<ReviewFetchResult> {
  return app.store === "google"
    ? fetchPlayReviews(app.id, country, lang, pages, sort)
    : fetchReviews(app.id, country, pages, sort);
}

const EMPTY_FEED_WARNING =
  "Apple's public review feed returned empty pages for this app, so the sample is partial (fewer reviews than requested).";
const NO_REVIEWS_WARNING = "No reviews returned. The app may not exist in this storefront or has no written reviews.";

/** True when Apple's feed dropped pages and the sample came back empty or under half the requested size. */
const feedSparse = (res: { reviews: unknown[]; pagesRequested: number; emptyPages?: number }) =>
  (res.emptyPages ?? 0) > 0 && res.reviews.length < (res.pagesRequested * 50) / 2;

const SAMPLE_NOTE: Record<Store, string> = {
  apple: "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population.",
  google: "Sample = most recent written reviews from Google Play in the requested language; it is not the full store rating population.",
};

// ---------------------------------------------------------------------------
// Result helpers
// ---------------------------------------------------------------------------

function ok(data: Record<string, unknown>): CallToolResult {
  return {
    content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
    structuredContent: data,
  };
}

function fail(err: unknown): CallToolResult {
  let kind = "internal_error";
  if (err instanceof UserInputError) kind = "invalid_input";
  else if (err instanceof UpstreamError) kind = "upstream_error";
  if (kind === "internal_error") console.error("[tool] unexpected error:", err);
  return {
    isError: true,
    content: [{ type: "text", text: `Error (${kind}): ${errorMessage(err)}` }],
  };
}

/** Wrap a handler so every failure becomes a well-formed MCP tool error. */
function safe<A>(fn: (args: A) => Promise<CallToolResult>): (args: A) => Promise<CallToolResult> {
  return async (args: A) => {
    try {
      return await fn(args);
    } catch (err) {
      return fail(err);
    }
  };
}

function appBrief(app: AppSummary | undefined) {
  if (!app) return null;
  return {
    id: app.id,
    name: app.name,
    developer: app.developer,
    genre: app.genre,
    averageRating: app.averageRating !== null ? round(app.averageRating, 2) : null,
    ratingCount: app.ratingCount,
    version: app.version,
    currentVersionReleaseDate: app.currentVersionReleaseDate,
    ...(app.installs != null ? { installs: app.installs } : {}),
    url: app.url,
  };
}

function dateRange(reviews: Review[]) {
  const dates = reviews.map((r) => r.date).filter((d): d is string => !!d).sort();
  return { from: dates[0] ?? null, to: dates[dates.length - 1] ?? null };
}

// ---------------------------------------------------------------------------
// Server factory
// ---------------------------------------------------------------------------

export function createServer(): McpServer {
  const play = googlePlayEnabled();
  // Google-only params are left out entirely when Google Play is disabled.
  const playParams: Record<string, z.ZodType> = play
    ? { store: storeSchema(true), lang: langSchema }
    : { store: storeSchema(false) };
  const appIdParam = appIdSchema(play);

  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions: play
        ? "App review intelligence for the Apple App Store and Google Play (no API keys). Typical flow: " +
          "search_apps to get an app id → review_insights for a one-call summary (ratings, complaints, what got worse " +
          "in the latest version) → get_app_reviews only when you need raw review text → compare_apps for competitor " +
          "benchmarks. Apple ids are numeric (284882215); Google Play ids are package names (com.instagram.android); " +
          "the store is inferred from the id. Review data is a recent sample (≤500 reviews per country per call), " +
          "not the full rating population."
        : "App review intelligence for the Apple App Store (no API keys). Typical flow: search_apps to get an app " +
          "id → review_insights for a one-call summary (ratings, complaints, what got worse in the latest version) → " +
          "get_app_reviews only when you need raw review text → compare_apps for competitor benchmarks. App ids are " +
          "numeric (284882215). Review data is a recent sample (≤500 reviews per country per call), not the full " +
          "rating population.",
    },
  );

  // (1) search_apps --------------------------------------------------------
  server.registerTool(
    "search_apps",
    {
      title: play ? "Search apps (App Store / Google Play)" : "Search App Store apps",
      description: play
        ? "Find apps by name or keyword and get the app id the other tools need. Returns id (Apple numeric id or " +
          "Google Play package name), name, developer, rating, rating count, price, genre, current version, store URL " +
          '(Google adds installs). Use when the user names an app ("Duolingo", "Calm") or a category ("budget apps"). ' +
          'Set store: "google" for Android/Google Play. Cheap, one call. Next: review_insights or compare_apps.'
        : "Find App Store apps by name or keyword and get the app id the other tools need. Returns id, name, " +
          'developer, rating, rating count, price, genre, current version and store URL. Use when the user names an app ("Duolingo", "Calm") ' +
          'or a category ("budget apps"). Cheap, one call. Next: review_insights or compare_apps.',
      inputSchema: {
        term: z.string().trim().min(1).max(200).describe('App name or keywords, e.g. "notion" or "habit tracker".'),
        ...(play
          ? {
              store: z
                .enum(["apple", "google"])
                .default("apple")
                .describe('"apple" (App Store, default) or "google" (Google Play).'),
              lang: langSchema,
            }
          : { store: storeSchema(false) }),
        country: countrySchema,
        limit: z.number().int().min(1).max(50).default(10).describe("Max results (1-50). Default 10."),
      },
      annotations: { title: "Search apps", ...READ_ONLY },
    },
    safe(async ({ term, store = "apple", country, lang = "en", limit }: { term: string; store?: Store; country: string; lang?: string; limit: number }) => {
      if (store === "google" && !play) throw new UserInputError(GOOGLE_PLAY_DISABLED_MESSAGE);
      const c = normalizeCountry(country);
      const apps = store === "google" ? await searchPlayApps(term, c, lang, limit) : await searchApps(term, c, limit);
      await chargeEvent(store === "google" ? BillingEvents.PLAY_SEARCH : BillingEvents.SEARCH, 1);
      return ok({
        term,
        store,
        country: c,
        count: apps.length,
        apps: apps.map((a) => ({
          // Google search cards lack many Apple-only fields; omit the nulls rather than pad the response.
          ...(store === "google" ? Object.fromEntries(Object.entries(a).filter(([, v]) => v !== null)) : a),
          averageRating: a.averageRating !== null ? round(a.averageRating, 2) : null,
          currentVersionAverageRating:
            a.currentVersionAverageRating !== null ? round(a.currentVersionAverageRating, 2) : null,
          description: a.description ? truncate(a.description, 300) : null,
        })),
      });
    }),
  );

  // (2) get_app_reviews ----------------------------------------------------
  server.registerTool(
    "get_app_reviews",
    {
      title: "Get raw app reviews",
      description:
        (play
          ? "Fetch raw reviews for one app: rating, title (Apple only), text, app version, date, helpful votes " +
            "(Google adds developer replies). "
          : "Fetch raw reviews for one App Store app: rating, title, text, app version, date, helpful votes. ") +
        "Use when the user wants to read or quote actual reviews or you need " +
        "text for custom analysis. For summaries, complaints or \"what broke\", call review_insights instead: it is " +
        "one flat-priced call. Billed per review returned (~50 per page; default 1 page). Max 10 pages ≈ 500 reviews.",
      inputSchema: {
        app_id: appIdParam,
        ...playParams,
        country: countrySchema,
        pages: pagesSchema(1),
        sort: z
          .enum(["mostrecent", "mosthelpful"])
          .default("mostrecent")
          .describe('"mostrecent" (default) or "mosthelpful" (most upvoted).'),
      },
      annotations: { title: "Get raw app reviews", ...READ_ONLY },
    },
    safe(async ({ app_id, store, country, lang = "en", pages, sort }: { app_id: string | number; store?: Store; country: string; lang?: string; pages: number; sort: ReviewSort }) => {
      const app = resolveApp(app_id, store);
      const c = normalizeCountry(country);
      const res = await loadReviews(app, c, pages, sort, lang);
      await chargeEvent(app.store === "google" ? BillingEvents.PLAY_REVIEW : BillingEvents.REVIEW, res.reviews.length);
      return ok({
        appId: app.id,
        store: app.store,
        country: c,
        sort,
        pagesRequested: res.pagesRequested,
        pagesFetched: res.pagesFetched,
        count: res.reviews.length,
        ...(res.emptyPages ? { emptyPages: res.emptyPages } : {}),
        ...(feedSparse(res) && res.reviews.length > 0
          ? { note: EMPTY_FEED_WARNING }
          : res.reviews.length === 0
            ? {
                note:
                  (feedSparse(res) ? EMPTY_FEED_WARNING + " Otherwise the app may not exist in this storefront." : NO_REVIEWS_WARNING) +
                  (app.store === "google" ? " If this is an Apple bundle id, use the numeric App Store id instead." : ""),
              }
            : {}),
        ...(res.errors.length ? { warnings: res.errors } : {}),
        reviews: res.reviews.map((r) => ({
          id: r.id,
          author: r.author,
          rating: r.rating,
          title: r.title,
          body: r.body,
          version: r.version,
          date: r.date,
          helpfulVotes: r.voteSum,
          totalVotes: r.voteCount,
          ...(r.developerReply ? { developerReply: r.developerReply } : {}),
        })),
      });
    }),
  );

  // (3) review_insights ----------------------------------------------------
  server.registerTool(
    "review_insights",
    {
      title: "Review insights & what got worse",
      description:
        "Best first call for any question about an app's user feedback. Analyses recent reviews and returns: rating " +
        "distribution, average rating per app version, top complaint phrases from 1-2★ reviews (share + example " +
        "quote), versionDeltas (latest version vs earlier: rating change, negative-share change, rising complaints " +
        "with quotes; falls back to last 3 days vs earlier), and sample quotes. Use for \"why are users unhappy " +
        "with X\", \"what broke in the last update\", \"top complaints about X\", \"summarize feedback\". One flat " +
        "price per call regardless of pages/countries. For the review text itself use get_app_reviews; to benchmark " +
        "several apps at once use compare_apps." + (play ? " Apple and Google Play." : ""),
      inputSchema: {
        app_id: appIdParam,
        ...playParams,
        countries: z
          .array(z.string().regex(/^[A-Za-z]{2}$/, "must be a 2-letter ISO country code"))
          .min(1)
          .max(10)
          .default(["us"])
          .describe('Storefronts to pool, e.g. ["us","gb","ca"]. Default ["us"]. More countries = bigger sample.'),
        pages: pagesSchema(3),
        since_version: z
          .string()
          .trim()
          .regex(/^[0-9A-Za-z.\-]{1,40}$/, "must be a version string such as 450.1.0")
          .optional()
          .describe(
            'Optional: compare reviews on this version and newer against older versions (e.g. "450.0.0"). ' +
              "Default: newest version in the sample vs earlier ones.",
          ),
        keyword_limit: z.number().int().min(1).max(50).default(15).describe("Complaint phrases to return. Default 15."),
        quotes: z.number().int().min(0).max(10).default(3).describe("Sample quotes per sentiment (0-10). Default 3."),
      },
      annotations: { title: "Review insights", ...READ_ONLY },
    },
    safe(async ({
      app_id, store, countries, lang = "en", pages, since_version, keyword_limit, quotes,
    }: {
      app_id: string | number; store?: Store; countries: string[]; lang?: string; pages: number;
      since_version?: string; keyword_limit: number; quotes: number;
    }) => {
      const target = resolveApp(app_id, store);
      const id = target.id;
      const cs = [...new Set(countries.map(normalizeCountry))];

      const [app, perCountry] = await Promise.all([
        (target.store === "google"
          ? lookupPlayApp(id, cs[0]!, lang).then((a) => a ?? undefined)
          : lookupApps([id], cs[0]!).then((m) => m.get(id))
        ).catch(() => undefined),
        mapLimit(cs, 2, async (c) => {
          try {
            const r = await loadReviews(target, c, pages, "mostrecent", lang);
            return { country: c, ...r, error: null as string | null };
          } catch (err) {
            return { country: c, reviews: [] as Review[], pagesRequested: pages, pagesFetched: 0, errors: [], error: errorMessage(err) };
          }
        }),
      ]);

      const failed = perCountry.filter((p) => p.error);
      if (failed.length === perCountry.length) {
        throw new UpstreamError(`Could not fetch reviews for any country: ${failed.map((f) => `${f.country}: ${f.error}`).join("; ")}`);
      }

      // Google Play serves overlapping reviews across countries; keep each review once.
      const seen = new Set<string>();
      const reviews = perCountry
        .flatMap((p) => p.reviews)
        .filter((r) => (r.id ? !seen.has(r.id) && !!seen.add(r.id) : true));
      const negatives = reviews.filter((r) => r.rating <= 2);
      const positives = reviews.filter((r) => r.rating >= 4);
      const dist = ratingDistribution(reviews);
      const pagesFetched = perCountry.reduce((s, p) => s + p.pagesFetched, 0);
      const emptyPages = perCountry.reduce((s, p) => s + ((p as { emptyPages?: number }).emptyPages ?? 0), 0);
      const nameStop = nameStopwords(app?.name, app?.developer);

      const keywords = topKeywords(negatives, {
        limit: keyword_limit,
        minReviews: negatives.length >= 40 ? 3 : 2,
        extraStopwords: nameStop,
      });
      const deltas = versionDeltas(reviews, { sinceVersion: since_version, extraStopwords: nameStop });
      const byVersion = ratingByVersion(reviews);

      await chargeEvent(target.store === "google" ? BillingEvents.PLAY_INSIGHTS : BillingEvents.INSIGHTS, 1);

      const warnings = [
        ...failed.map((f) => `${f.country}: ${f.error}`),
        ...perCountry.flatMap((p) => p.errors.map((e) => `${p.country}: ${e}`)),
      ];
      if (perCountry.some((p) => feedSparse(p)) && (app || reviews.length > 0)) warnings.push(EMPTY_FEED_WARNING);
      else if (reviews.length === 0) warnings.push(NO_REVIEWS_WARNING);

      return ok({
        app: appBrief(app) ?? { id },
        store: target.store,
        sample: {
          reviews: reviews.length,
          negativeReviews: negatives.length,
          positiveReviews: positives.length,
          pagesFetched,
          ...(target.store === "apple" ? { emptyPages } : {}),
          byCountry: Object.fromEntries(perCountry.map((p) => [p.country, p.reviews.length])),
          dateRange: dateRange(reviews),
          note: SAMPLE_NOTE[target.store],
        },
        ratingDistribution: dist,
        storeRating: app
          ? { averageRating: app.averageRating !== null ? round(app.averageRating, 2) : null, ratingCount: app.ratingCount }
          : null,
        ratingByVersion: byVersion.slice(0, 20),
        ...(byVersion.length > 20 ? { ratingByVersionTruncated: byVersion.length - 20 } : {}),
        versionDeltas: deltas,
        complaintKeywords: keywords,
        quotes: {
          negative: sampleQuotes(negatives, quotes),
          positive: sampleQuotes(positives, quotes),
        },
        ...(warnings.length ? { warnings } : {}),
      });
    }),
  );

  // (4) compare_apps -------------------------------------------------------
  server.registerTool(
    "compare_apps",
    {
      title: "Compare apps side by side",
      description:
        "Benchmark 2-10 apps in one storefront for competitor analysis: store rating, rating count, price, current " +
        (play ? "version & release date (Google adds installs)" : "version & release date") +
        ", plus recent-review metrics (sample average, % negative / positive, latest-version average, top 5 " +
        "complaints) and per-metric leaders. " +
        (play ? "Apple ids and Google Play package names can be mixed (e.g. iOS vs Android of the same app). " : "") +
        'Examples: "Notion vs Evernote", "which meditation app has the happiest users". One flat price per call. ' +
        "Get ids from search_apps first. For one app in depth (version deltas, more quotes) use review_insights instead.",
      inputSchema: {
        app_ids: z
          .array(appIdParam)
          .min(2)
          .max(10)
          .describe(
            play
              ? '2-10 app ids, e.g. ["284882215","389801252"] or ["389801252","com.instagram.android"].'
              : '2-10 App Store app ids, e.g. ["284882215","389801252"].',
          ),
        country: countrySchema,
        ...(play ? { lang: langSchema } : {}),
        pages: pagesSchema(2),
      },
      annotations: { title: "Compare apps", ...READ_ONLY },
    },
    safe(async ({ app_ids, country, lang = "en", pages }: { app_ids: (string | number)[]; country: string; lang?: string; pages: number }) => {
      const targets = [...new Map(app_ids.map((a) => resolveApp(a)).map((t) => [`${t.store}:${t.id}`, t])).values()];
      if (targets.length < 2) throw new UserInputError("compare_apps needs at least 2 distinct app ids");
      const c = normalizeCountry(country);

      const appleIds = targets.filter((t) => t.store === "apple").map((t) => t.id);
      const googleIds = targets.filter((t) => t.store === "google").map((t) => t.id);
      const [appleMeta, googleMeta] = await Promise.all([
        appleIds.length ? lookupApps(appleIds, c) : new Map<string, AppSummary>(),
        mapLimit(googleIds, 3, (id) => lookupPlayApp(id, c, lang).catch(() => null)),
      ]);
      const meta = new Map<string, AppSummary>();
      for (const [id, a] of appleMeta) meta.set(`apple:${id}`, a);
      googleIds.forEach((id, i) => googleMeta[i] && meta.set(`google:${id}`, googleMeta[i]!));

      const table = await mapLimit(targets, 2, async (t) => {
        const app = meta.get(`${t.store}:${t.id}`);
        let reviews: Review[] = [];
        let error: string | null = null;
        try {
          reviews = (await loadReviews(t, c, pages, "mostrecent", lang)).reviews;
        } catch (err) {
          error = errorMessage(err);
        }
        const dist = ratingDistribution(reviews);
        const negatives = reviews.filter((r) => r.rating <= 2);
        const latestVersion = app?.version ?? ratingByVersion(reviews.filter((r) => r.version))[0]?.version ?? null;
        const latest = latestVersion ? reviews.filter((r) => r.version === latestVersion) : [];
        return {
          id: t.id,
          store: t.store,
          found: !!app,
          name: app?.name ?? null,
          developer: app?.developer ?? null,
          genre: app?.genre ?? null,
          price: app?.formattedPrice ?? null,
          storeAverageRating: app?.averageRating != null ? round(app.averageRating, 2) : null,
          storeRatingCount: app?.ratingCount ?? null,
          ...(t.store === "google" ? { installs: app?.installs ?? null } : {}),
          currentVersion: app?.version ?? null,
          currentVersionReleaseDate: app?.currentVersionReleaseDate ?? null,
          sizeMB: app?.sizeBytes != null ? round(app.sizeBytes / 1_048_576, 1) : null,
          recentReviewSample: dist.total,
          recentAverageRating: dist.average,
          recentNegativeShare: dist.total ? round(negatives.length / dist.total, 3) : null,
          recentPositiveShare: dist.total ? round((dist.counts["4"] + dist.counts["5"]) / dist.total, 3) : null,
          latestVersion,
          latestVersionAverageRating: latest.length
            ? round(latest.reduce((s, r) => s + r.rating, 0) / latest.length, 2)
            : null,
          latestVersionReviewCount: latest.length,
          ratingDistribution: dist.counts,
          reviewDateRange: dateRange(reviews),
          topComplaints: topKeywords(negatives, {
            limit: 5,
            extraStopwords: nameStopwords(app?.name, app?.developer),
          }).map((k) => ({ phrase: k.phrase, reviews: k.reviews, share: k.share })),
          ...(error ? { error } : {}),
        };
      });

      if (!table.some((r) => r.found || r.recentReviewSample > 0)) {
        throw new UserInputError(`None of the apps were found in the '${c}' storefront: ${targets.map((t) => t.id).join(", ")}`);
      }
      await chargeEvent(googleIds.length ? BillingEvents.PLAY_COMPARE : BillingEvents.COMPARE, 1);

      type Row = (typeof table)[number];
      const leader = (key: keyof Row, dir: "max" | "min") => {
        const candidates = table.filter((r) => typeof r[key] === "number");
        if (candidates.length < 2) return null;
        const best = candidates.reduce((a, b) =>
          dir === "max" ? ((b[key] as number) > (a[key] as number) ? b : a) : (b[key] as number) < (a[key] as number) ? b : a,
        );
        return { id: best.id, store: best.store, name: best.name, value: best[key] as number };
      };

      const missing = table.filter((r) => !r.found).map((r) => r.id);
      return ok({
        country: c,
        apps: table,
        leaders: {
          storeAverageRating: leader("storeAverageRating", "max"),
          storeRatingCount: leader("storeRatingCount", "max"),
          recentAverageRating: leader("recentAverageRating", "max"),
          lowestRecentNegativeShare: leader("recentNegativeShare", "min"),
          latestVersionAverageRating: leader("latestVersionAverageRating", "max"),
        },
        ...(missing.length ? { warnings: [`Not found in '${c}' storefront: ${missing.join(", ")}`] } : {}),
      });
    }),
  );

  return server;
}
