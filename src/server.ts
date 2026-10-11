import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import { BillingEvents, chargeEvent } from "./billing.js";
import {
  type AppSummary,
  type Review,
  MAX_REVIEW_PAGES,
  fetchReviews,
  lookupApps,
  searchApps,
} from "./itunes.js";
import { nameStopwords, ratingByVersion, ratingDistribution, sampleQuotes, topKeywords } from "./insights.js";
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
export const SERVER_VERSION = "1.0.0";

// ---------------------------------------------------------------------------
// Shared input schemas
// ---------------------------------------------------------------------------

const appIdSchema = z
  .union([z.number().int().positive(), z.string().min(1).max(300)])
  .describe('App Store numeric id (e.g. 284882215), "id284882215", or an apps.apple.com URL');

const countrySchema = z
  .string()
  .regex(/^[A-Za-z]{2}$/, "must be a 2-letter ISO country code")
  .default("us")
  .describe('2-letter App Store storefront code, e.g. "us", "gb", "de". Default "us".');

const pagesSchema = (def: number) =>
  z
    .number()
    .int()
    .min(1)
    .max(MAX_REVIEW_PAGES)
    .default(def)
    .describe(`Number of review feed pages to fetch (1-${MAX_REVIEW_PAGES}, ~50 reviews each). Default ${def}.`);

const READ_ONLY = { readOnlyHint: true, destructiveHint: false, idempotentHint: true, openWorldHint: true } as const;

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
  const server = new McpServer(
    { name: SERVER_NAME, version: SERVER_VERSION },
    {
      instructions:
        "App Store review intelligence. Use search_apps to find an app id, get_app_reviews for raw reviews, " +
        "review_insights for rating distribution / version trends / complaint keywords, and compare_apps for " +
        "side-by-side metrics. All data comes from Apple's public iTunes endpoints; review feeds expose at most " +
        "the 500 most recent (or most helpful) reviews per country.",
    },
  );

  // (1) search_apps --------------------------------------------------------
  server.registerTool(
    "search_apps",
    {
      title: "Search App Store apps",
      description:
        "Search the Apple App Store for apps by keyword. Returns app ids, names, developers, ratings, rating counts, " +
        "price, current version and store URL. Use the returned id with the review tools.",
      inputSchema: {
        term: z.string().trim().min(1).max(200).describe("Search keywords, e.g. 'photo editor' or an app name"),
        country: countrySchema,
        limit: z.number().int().min(1).max(50).default(10).describe("Max results (1-50). Default 10."),
      },
      annotations: { title: "Search App Store apps", ...READ_ONLY },
    },
    safe(async ({ term, country, limit }) => {
      const c = normalizeCountry(country);
      const apps = await searchApps(term, c, limit);
      await chargeEvent(BillingEvents.SEARCH, 1);
      return ok({
        term,
        country: c,
        count: apps.length,
        apps: apps.map((a) => ({
          ...a,
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
      title: "Get App Store reviews",
      description:
        "Fetch customer reviews for an App Store app from Apple's public review feed. Returns normalized reviews " +
        "(id, author, rating, title, body, version, date). Each page holds up to 50 reviews; Apple serves at most 10 pages.",
      inputSchema: {
        app_id: appIdSchema,
        country: countrySchema,
        pages: pagesSchema(1),
        sort: z
          .enum(["mostrecent", "mosthelpful"])
          .default("mostrecent")
          .describe("Feed ordering: 'mostrecent' (default) or 'mosthelpful'"),
      },
      annotations: { title: "Get App Store reviews", ...READ_ONLY },
    },
    safe(async ({ app_id, country, pages, sort }) => {
      const id = parseAppId(app_id);
      const c = normalizeCountry(country);
      const res = await fetchReviews(id, c, pages, sort);
      await chargeEvent(BillingEvents.REVIEW, res.reviews.length);
      return ok({
        appId: id,
        country: c,
        sort,
        pagesRequested: res.pagesRequested,
        pagesFetched: res.pagesFetched,
        count: res.reviews.length,
        ...(res.reviews.length === 0
          ? { note: "No reviews returned. The app may not exist in this storefront or has no written reviews." }
          : {}),
        ...(res.errors.length ? { warnings: res.errors } : {}),
        reviews: res.reviews.map(({ id, author, rating, title, body, version, date, voteSum, voteCount }) => ({
          id,
          author,
          rating,
          title,
          body,
          version,
          date,
          helpfulVotes: voteSum,
          totalVotes: voteCount,
        })),
      });
    }),
  );

  // (3) review_insights ----------------------------------------------------
  server.registerTool(
    "review_insights",
    {
      title: "Review insights",
      description:
        "Aggregate recent reviews of an app across one or more storefronts: rating distribution, average rating by " +
        "app version (newest first), top complaint keywords/phrases from 1-2 star reviews (stopword-filtered 1-3 " +
        "word n-grams ranked by how many reviews mention them), and representative negative/positive quotes.",
      inputSchema: {
        app_id: appIdSchema,
        countries: z
          .array(z.string().regex(/^[A-Za-z]{2}$/, "must be a 2-letter ISO country code"))
          .min(1)
          .max(10)
          .default(["us"])
          .describe('Storefronts to aggregate, e.g. ["us","gb","ca"]. Default ["us"]. Max 10.'),
        pages: pagesSchema(3),
        keyword_limit: z.number().int().min(1).max(50).default(15).describe("Number of complaint keywords to return"),
        quotes: z.number().int().min(0).max(10).default(3).describe("Sample quotes per sentiment bucket (0-10)"),
      },
      annotations: { title: "Review insights", ...READ_ONLY },
    },
    safe(async ({ app_id, countries, pages, keyword_limit, quotes }) => {
      const id = parseAppId(app_id);
      const cs = [...new Set(countries.map(normalizeCountry))];

      const [meta, perCountry] = await Promise.all([
        lookupApps([id], cs[0]!).catch(() => new Map<string, AppSummary>()),
        mapLimit(cs, 2, async (c) => {
          try {
            const r = await fetchReviews(id, c, pages, "mostrecent");
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

      const app = meta.get(id);
      const reviews = perCountry.flatMap((p) => p.reviews);
      const negatives = reviews.filter((r) => r.rating <= 2);
      const positives = reviews.filter((r) => r.rating >= 4);
      const dist = ratingDistribution(reviews);
      const pagesFetched = perCountry.reduce((s, p) => s + p.pagesFetched, 0);

      const keywords = topKeywords(negatives, {
        limit: keyword_limit,
        minReviews: negatives.length >= 40 ? 3 : 2,
        extraStopwords: nameStopwords(app?.name, app?.developer),
      });

      await chargeEvent(BillingEvents.INSIGHTS, 1);

      const warnings = [
        ...failed.map((f) => `${f.country}: ${f.error}`),
        ...perCountry.flatMap((p) => p.errors.map((e) => `${p.country}: ${e}`)),
      ];

      return ok({
        app: appBrief(app) ?? { id },
        sample: {
          reviews: reviews.length,
          negativeReviews: negatives.length,
          positiveReviews: positives.length,
          pagesFetched,
          byCountry: Object.fromEntries(perCountry.map((p) => [p.country, p.reviews.length])),
          dateRange: dateRange(reviews),
          note: "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population.",
        },
        ratingDistribution: dist,
        storeRating: app
          ? { averageRating: app.averageRating !== null ? round(app.averageRating, 2) : null, ratingCount: app.ratingCount }
          : null,
        ratingByVersion: ratingByVersion(reviews),
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
      title: "Compare apps",
      description:
        "Side-by-side comparison of 2-10 App Store apps in one storefront: store rating & rating count, price, size, " +
        "current version & release date, plus metrics from recent reviews (sample average, % negative/positive, " +
        "latest-version average, top complaint keywords). Includes per-metric leaders.",
      inputSchema: {
        app_ids: z.array(appIdSchema).min(2).max(10).describe("2-10 App Store app ids"),
        country: countrySchema,
        pages: pagesSchema(2),
      },
      annotations: { title: "Compare apps", ...READ_ONLY },
    },
    safe(async ({ app_ids, country, pages }) => {
      const ids = [...new Set(app_ids.map(parseAppId))];
      if (ids.length < 2) throw new UserInputError("compare_apps needs at least 2 distinct app ids");
      const c = normalizeCountry(country);

      const meta = await lookupApps(ids, c);
      const table = await mapLimit(ids, 2, async (id) => {
        const app = meta.get(id);
        let reviews: Review[] = [];
        let error: string | null = null;
        try {
          const r = await fetchReviews(id, c, pages, "mostrecent");
          reviews = r.reviews;
        } catch (err) {
          error = errorMessage(err);
        }
        const dist = ratingDistribution(reviews);
        const negatives = reviews.filter((r) => r.rating <= 2);
        const latestVersion = app?.version ?? ratingByVersion(reviews)[0]?.version ?? null;
        const latest = latestVersion ? reviews.filter((r) => r.version === latestVersion) : [];
        return {
          id,
          found: !!app,
          name: app?.name ?? null,
          developer: app?.developer ?? null,
          genre: app?.genre ?? null,
          price: app?.formattedPrice ?? null,
          storeAverageRating: app?.averageRating != null ? round(app.averageRating, 2) : null,
          storeRatingCount: app?.ratingCount ?? null,
          currentVersion: app?.version ?? null,
          currentVersionReleaseDate: app?.currentVersionReleaseDate ?? null,
          sizeMB: app?.sizeBytes != null ? round(app.sizeBytes / 1_048_576, 1) : null,
          recentReviewSample: dist.total,
          recentAverageRating: dist.average,
          recentNegativeShare: dist.total ? round(negatives.length / dist.total, 3) : null,
          recentPositiveShare: dist.total ? round((dist.counts["4"] + dist.counts["5"]) / dist.total, 3) : null,
          latestVersionAverageRating: latest.length
            ? round(latest.reduce((s, r) => s + r.rating, 0) / latest.length, 2)
            : null,
          latestVersionReviewCount: latest.length,
          ratingDistribution: dist.counts,
          reviewDateRange: dateRange(reviews),
          topComplaints: topKeywords(negatives, {
            limit: 5,
            extraStopwords: nameStopwords(app?.name, app?.developer),
          }).map((k) => ({ phrase: k.phrase, reviews: k.reviews })),
          ...(error ? { error } : {}),
        };
      });

      if (!table.some((r) => r.found || r.recentReviewSample > 0)) {
        throw new UserInputError(`None of the app ids were found in the '${c}' storefront: ${ids.join(", ")}`);
      }
      await chargeEvent(BillingEvents.COMPARE, 1);

      type Row = (typeof table)[number];
      const leader = (key: keyof Row, dir: "max" | "min") => {
        const candidates = table.filter((r) => typeof r[key] === "number");
        if (candidates.length < 2) return null;
        const best = candidates.reduce((a, b) =>
          dir === "max" ? ((b[key] as number) > (a[key] as number) ? b : a) : (b[key] as number) < (a[key] as number) ? b : a,
        );
        return { id: best.id, name: best.name, value: best[key] as number };
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
