# App Store & Google Play Review Intelligence MCP Server

**Ask your AI agent what users hate about any iOS or Android app, and what broke in the last update.** This [MCP](https://modelcontextprotocol.io) server searches the Apple App Store and Google Play, pulls recent reviews for any app (yours or a competitor's), and returns analysis your agent can use directly: top complaints with quotes, rating by version, **what got worse in the latest version**, and side-by-side competitor benchmarks. No API keys, no App Store Connect or Play Console access needed.

> **Hosted (no setup):** [apify.com/parallelstudio/app-store-review-intelligence-mcp](https://apify.com/parallelstudio/app-store-review-intelligence-mcp). Connect any MCP client to `https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp` with your Apify token and pay per call. You can also run this open-source code locally over stdio: `npm install && npm run build && npx app-review-intel-mcp`.

> **Now with Google Play:** every tool works on both the Apple App Store and Google Play, including iOS-vs-Android comparisons.

<!-- mcp-name: io.github.gunnargray-dev/app-store-review-intelligence-mcp -->

Works with Claude Desktop, Claude Code, Cursor, VS Code, Windsurf and any client that supports MCP over Streamable HTTP.

## What you can ask

- **"What broke in Instagram's last update?"** `review_insights` compares the newest version with the previous one: rating change, negative-share change, and the complaints that rose most, with quotes.
- **"Top 10 complaints about Duolingo on Android vs iOS."** Same tool, either store. The store is inferred from the app id.
- **"Compare Notion, Obsidian and Evernote. Who has the unhappiest users, and why?"** `compare_apps` gives one table with leaders per metric. You can mix Apple and Google Play ids.
- **"Find the top meditation apps on Google Play."** `search_apps` returns ids, ratings, installs and prices.
- **"Show me the latest reviews mentioning crashes."** `get_app_reviews` returns raw review text for your own analysis.

## Tools

| Tool | Use it when | Returns | Billing |
|---|---|---|---|
| `search_apps` | You have an app name or a category and need its id | id (Apple numeric id or Play package name), name, developer, rating, rating count, price, genre, version, URL; installs on Google Play | per call |
| `review_insights` | **Start here** for any "why are users unhappy / what changed / summarize feedback" question | rating distribution, rating by version, top complaint phrases (share of 1–2★ reviews + quote), `versionDeltas` (latest vs previous version: rating change, rising complaints with quotes), sample quotes | flat per call |
| `get_app_reviews` | You need the actual review text | reviews with rating, title (Apple), body, version, date, helpful votes; developer replies on Google Play | per review returned |
| `compare_apps` | Competitor benchmark of 2–10 apps (Apple and Google can be mixed) | store rating & count, installs, price, version, recent average, % negative/positive, latest-version average, top 5 complaints, leaders | flat per call |

**Parameters.** `app_id` accepts an Apple id (`284882215`, `id284882215`, or an apps.apple.com URL) or a Google Play package name (`com.instagram.android` or a play.google.com URL). `store` (`apple` | `google`) is optional because it's inferred from the id. On `search_apps` it defaults to `apple`. `country` is a 2-letter storefront code (`us`, `gb`, `de`…). `pages` is 1–10, about 50 reviews each. `lang` (Google Play only, default `en`) picks the review language. `review_insights` also takes `countries` (pool up to 10 storefronts), `since_version` (choose the version to compare from), `keyword_limit` and `quotes`.

All tools are read-only. Errors come back as MCP tool errors (`isError: true`), prefixed `invalid_input`, `upstream_error` or `internal_error`.

## Example output

`review_insights` `{ "app_id": "389801252", "countries": ["us", "gb"] }` (Instagram for iOS, real call, October 2026, trimmed):

```json
{
  "sample": { "reviews": 300, "negativeReviews": 188, "byCountry": { "us": 150, "gb": 150 } },
  "ratingDistribution": { "average": 2.42, "total": 300 },
  "storeRating": { "averageRating": 4.69, "ratingCount": 29583259 },
  "versionDeltas": {
    "basis": "version",
    "latest":   { "label": "450.1.0", "reviews": 210, "averageRating": 2.17, "negativeShare": 0.695 },
    "previous": { "label": "previous versions 448.0.0–450.0.0", "reviews": 90, "averageRating": 3.0, "negativeShare": 0.467 },
    "change": { "averageRating": -0.83, "negativeShare": 0.228 },
    "whatGotWorse": [
      { "phrase": "ipad", "status": "new", "latestShare": 0.24, "previousShare": 0, "change": 0.24,
        "examples": [{ "rating": 1, "text": "iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page?…" }] },
      { "phrase": "reels", "status": "increased", "latestShare": 0.281, "previousShare": 0.095, "change": 0.186 },
      { "phrase": "full screen", "status": "new", "latestShare": 0.11, "previousShare": 0, "change": 0.11,
        "examples": [{ "rating": 1, "text": "Broken UI in latest update. Can no longer see full screen reels in iPad. They now crop reels to square format…" }] }
    ],
    "confidence": "high",
    "summary": "Version 450.1.0 (210 reviews) average 2.17★ vs 3.00★ for previous versions 448.0.0–450.0.0 (90 reviews), −0.83; negative share 69.5% vs 46.7% (+22.8 pp). Rising complaints: \"ipad\" (new, 24% of negative reviews), …"
  },
  "complaintKeywords": [
    { "phrase": "reels", "reviews": 45, "share": 0.239, "example": "…" },
    { "phrase": "ipad", "reviews": 35, "share": 0.186, "example": "…" },
    { "phrase": "account", "reviews": 34, "share": 0.181, "example": "…" },
    { "phrase": "full screen", "reviews": 16, "share": 0.085, "example": "…" }
  ]
}
```

`search_apps` `{ "term": "meditation", "store": "google", "limit": 3 }`:

| id | name | developer | rating | installs |
|---|---|---|---|---|
| com.spotlightsix.zentimerlite2 | Insight Timer - Meditation App | Insight Network Inc | 4.70 | 10,000,000+ |
| meditofoundation.medito | Medito: Meditation & Sleep | Medito for Mindfulness, Meditation and Sleep | 4.79 | 1,000,000+ |
| com.getsomeheadspace.android | Headspace: Sleep & Meditation | Headspace for Meditation, Mindfulness and Sleep | 4.26 | 10,000,000+ |

`compare_apps` `{ "app_ids": ["324684580", "com.spotify.music"], "pages": 1 }` compares Spotify on iOS and Android. It reports a 4.77 vs 4.35 store rating, a 4.18 vs 3.90 recent average, and 16% vs 28% negative reviews. Top Android complaints: premium, song, ads.

See [`demo/transcript.md`](demo/transcript.md) for full, untrimmed responses from every tool.

## Pricing

Pay-per-event: you pay only for successful calls. Calls that fail validation or can't reach the store are not charged. Current prices are on the Actor's **Pricing** tab.

| Event | Price | Charged for |
|---|---|---|
| `search-apps` | $0.002 | each App Store `search_apps` call |
| `review` | $0.001 | each App Store review returned by `get_app_reviews` (50 reviews = 50 events; 0 = free) |
| `review-insights` | $0.03 | each App Store `review_insights` call, flat. Reviews analyzed internally are **not** charged as `review` events |
| `compare-apps` | $0.05 | each `compare_apps` call with only App Store apps, flat however many apps or reviews |

Google Play calls are billed as separate events at the same prices: `play-search` $0.002 per search, `play-review` $0.001 per review, `play-review-insights` $0.03 per call, `play-compare-apps` $0.05 per comparison that includes any Google Play app.

**Tip:** `review_insights` and `compare_apps` cost the same however many reviews they analyze. For aggregates they are much cheaper than pulling hundreds of raw reviews.

## Connect your MCP client

Endpoint (Streamable HTTP):

```
https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp
```

Authenticate with your [Apify API token](https://console.apify.com/settings/integrations) by sending it as `Authorization: Bearer <APIFY_TOKEN>`.

### Claude Desktop, Cursor, Windsurf (JSON config)

```json
{
  "mcpServers": {
    "app-store-reviews": {
      "type": "http",
      "url": "https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp",
      "headers": {
        "Authorization": "Bearer <APIFY_TOKEN>"
      }
    }
  }
}
```

If your client only supports stdio servers, bridge with [`mcp-remote`](https://www.npmjs.com/package/mcp-remote):

```json
{
  "mcpServers": {
    "app-store-reviews": {
      "command": "npx",
      "args": [
        "-y", "mcp-remote",
        "https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp",
        "--header", "Authorization: Bearer ${APIFY_TOKEN}"
      ],
      "env": { "APIFY_TOKEN": "<APIFY_TOKEN>" }
    }
  }
}
```

### Claude Code

```bash
claude mcp add --transport http app-store-reviews \
  https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp \
  --header "Authorization: Bearer $APIFY_TOKEN"
```

### VS Code (`.vscode/mcp.json`)

```json
{
  "servers": {
    "app-store-reviews": {
      "type": "http",
      "url": "https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp",
      "headers": { "Authorization": "Bearer ${input:apifyToken}" }
    }
  },
  "inputs": [{ "id": "apifyToken", "type": "promptString", "description": "Apify API token", "password": true }]
}
```

### Example prompts

- "Find the Duolingo app id and summarize what users complained about in the last 300 US reviews."
- "Did Instagram's latest iOS release make things worse? Use us, gb and ca."
- "Compare Spotify on iOS and Android: which platform's users are unhappier, and about what?"
- "Compare Spotify, Apple Music and YouTube Music on recent reviews and tell me each one's biggest complaint."

## How complaint keywords and "what got worse" are computed

The method is transparent and deterministic. It uses no LLM and no black-box model:

1. Tokenize each 1–2★ review. Curly and straight apostrophes are treated the same.
2. Build 1-, 2- and 3-word phrases made only of content words. Stopwords, filler ("never", "just", "still", "really", "keep"…), review boilerplate ("app", "update", "star"…), numbers and the app's own name and developer are excluded. Plurals and possessives are merged (`account`/`accounts`).
3. Rank phrases by **how many reviews mention them**, so one long rant can't dominate. Multi-word phrases get a small boost.
4. Drop redundant phrases. A word disappears when a longer phrase covers most of its mentions (`screen` → `full screen`), and near-duplicate phrases are merged.
5. **Version deltas:** split the sample into the newest app version and the version(s) just before it, or use `since_version`. Compare average rating and negative share, then rank phrases by how much their share of negative reviews rose. If the sample holds a single version, fall back to the last 3 days (or 24 hours) vs earlier. If that's not possible either, say so and suggest more `pages` or `countries`. A `confidence` level reflects how many negative reviews each side has.

## Limitations

- **Recent reviews, not the whole history.** Up to 500 reviews per app, storefront and call (Apple's feed serves 10 pages of 50; the same cap applies to Google Play). Insights describe *recent written reviews*. The store-wide rating and count are reported separately.
- **Busy apps cover only a few days.** For apps like Instagram, 150 reviews may span one day and a single version. `versionDeltas` then explains this and suggests more `pages` or `countries`.
- **Unofficial endpoints.** Apple's iTunes Search/Lookup APIs and RSS feed, and Google Play's public web endpoints, are key-less but undocumented for this use. They can change or rate-limit. The server retries with backoff, caches responses for 5 minutes, and returns partial results with `warnings` when a page or storefront fails.
- **Google Play specifics.** Reviews have no title, and filtering is by `lang` (default `en`) more than by country. Storefronts overlap, so `review_insights` de-duplicates reviews across countries. Many apps report "varies with device" instead of a version number. App size is not available.
- **Apple specifics.** The feed has no developer replies and no rating-only (unwritten) reviews.
- **English-centric keywords.** Reviews in any language are returned and counted, but the stopword list is mainly English, with basic Spanish, French and German.

## FAQ

**Do I need an Apple developer account, Play Console access or an API key?**
No. All data comes from public App Store and Google Play endpoints. You only need an Apify account and token to call this hosted server.

**Can I analyze apps I don't own?**
Yes. Any app listed on the App Store or Google Play works, including competitors' apps.

**How do I analyze the Android version of an app?**
Use its Google Play package name (`com.spotify.music`) or Play URL as `app_id`, or call `search_apps` with `store: "google"` to find it.

**Why is the sample average so different from the store rating?**
The store rating covers every rating the app has ever had, including the many silent 5★ taps. The sample covers only the most recent *written* reviews, and people who write reviews are more often unhappy. The gap is useful: a sharp drop in the recent average usually points to a problem in a recent release.

**How many reviews does `review_insights` analyze?**
`pages × 50` per storefront, up to 500 per country. With `pages: 10` and 10 countries, that's up to 5,000 reviews in one call, charged as a single event.

**Which countries are supported?**
Any storefront, by its 2-letter code. App Store reviews are separate per storefront, so pass several countries to `review_insights` for wider coverage. On Google Play, use `lang` to get reviews in other languages.

**Is any data stored?**
No. The server is stateless. It keeps only a short in-memory response cache and writes nothing to datasets or key-value stores.

**Can I self-host it?**
Yes. Run `npm install && npm run build`, then `node dist/index.js` for stdio or `node dist/index.js --http` for Streamable HTTP at `http://127.0.0.1:3000/mcp`. Self-hosted, billing is off unless you set `BILLING=apify`.

## Self-hosting and development

```bash
npm install
npm run build
npm start              # MCP over stdio
npm run start:http     # Streamable HTTP at http://127.0.0.1:3000/mcp (GET / and /health = health check)
npm test               # build + unit checks + end-to-end smoke test against live Apple and Google Play endpoints
```

| env var | default | purpose |
|---|---|---|
| `PORT` / `HOST` | `3000` / `127.0.0.1` | HTTP bind (`--http`); also `--port`, `--host` |
| `HTTP_TIMEOUT_MS` | `15000` | per-request timeout to Apple / Google Play |
| `HTTP_MAX_RETRIES` | `2` | retries on 408/425/429/5xx/network errors |
| `CACHE_TTL_MS` | `300000` | in-memory cache TTL (`0` disables) |
| `BILLING` | _(unset)_; `apify` in the Docker image | `apify` enables `Actor.charge()` pay-per-event billing |
| `GOOGLE_PLAY_ENABLED` | enabled | `false` hides Google Play from tool schemas and rejects Google Play ids with a "coming soon" error |

**On Apify (Standby mode).** When `APIFY_IS_AT_HOME` is set, the server calls `Actor.init()`, forces HTTP mode, and listens on `0.0.0.0:$ACTOR_WEB_SERVER_PORT`, falling back to `ACTOR_STANDBY_PORT`, then `PORT`. `GET /` answers the Standby readiness probe and MCP is served at `/mcp`. The HTTP server has no authentication of its own: on Apify, the platform authenticates requests with your API token. If you self-host it beyond localhost, put it behind an auth proxy.

```
.actor/        actor.json, input_schema.json (empty), output_schema.json (MCP endpoint)
Dockerfile     apify/actor-node:20, multi-stage TypeScript build, BILLING=apify
src/
  index.ts     entry: stdio or stateless Streamable HTTP; Apify Standby wiring
  server.ts    MCP tool registrations (zod schemas, error mapping, billing)
  http.ts      shared HTTP client: timeout, retry, cache
  itunes.ts    Apple API client: search, lookup, review feed parsing
  googleplay.ts Google Play client: search, app details, reviews (batchexecute)
  insights.ts  distribution, by-version stats, n-gram keywords, version deltas, quotes
  billing.ts   chargeEvent() → Actor.charge() when BILLING=apify
  util.ts      errors, cache, concurrency limiter, input normalization
test/smoke.mjs unit checks + end-to-end test via the MCP SDK client (stdio + HTTP)
```

## License

MIT
