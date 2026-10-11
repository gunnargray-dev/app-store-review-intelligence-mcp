# App Store Review Intelligence MCP Server

> **Hosted version (no setup):** [apify.com/parallelstudio/app-store-review-intelligence-mcp](https://apify.com/parallelstudio/app-store-review-intelligence-mcp). Connect any MCP client to `https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp` with your Apify token, pay per call. This repo is the open-source code; you can also run it locally with `npm install && npm run build && npx app-review-intel-mcp` (stdio).

<!-- mcp-name: io.github.gunnargray-dev/app-store-review-intelligence-mcp -->

Give your AI agent live access to **Apple App Store reviews**. This [MCP](https://modelcontextprotocol.io) server searches the App Store, pulls customer reviews for any iOS app, and turns them into insights you can act on: rating distribution, average rating per app version, top complaint keywords, representative quotes, and side-by-side competitor comparisons.

It works with Claude Desktop, Claude Code, Cursor, VS Code, Windsurf and any other client that supports MCP over Streamable HTTP. You don't need an Apple account or an App Store Connect key, and you don't need to own the apps you analyze.

## What you can do with it

- **Find release regressions.** "Did ratings drop after version 582.0? What are people complaining about?"
- **Research competitors.** "Compare Notion, Obsidian and Evernote. Which has the most negative recent reviews and why?"
- **Prioritize your roadmap.** "Summarize the top 10 complaints in 1–2★ reviews across US, UK and Canada."
- **Monitor sentiment.** Feed the latest reviews into your own agent workflow, reporting or alerting.
- **Look up apps.** Search by keyword to get app ids, ratings, rating counts, prices and versions.

## Tools

| Tool | What it does | Key parameters |
|---|---|---|
| `search_apps` | Searches the App Store by keyword. Returns id, name, developer, genre, price, average rating, rating count, current version, release dates, size, store URL and a short description. | `term`, `country` (default `us`), `limit` (1–50, default 10) |
| `get_app_reviews` | Fetches normalized customer reviews: id, author, rating, title, body, app version, date and helpful votes. | `app_id`, `country`, `pages` (1–10, ~50 reviews each, default 1), `sort` (`mostrecent` \| `mosthelpful`) |
| `review_insights` | Analyzes recent reviews across one or more storefronts. Returns rating distribution, average rating by version (newest first), top complaint keywords and phrases from 1–2★ reviews, and representative negative and positive quotes. | `app_id`, `countries` (1–10, default `["us"]`), `pages` (per country, default 3), `keyword_limit`, `quotes` |
| `compare_apps` | Compares 2–10 apps side by side: store rating and count, price, size, current version, recent-review average, % negative and % positive, latest-version average, top complaints, and the leader for each metric. | `app_ids` (2–10), `country`, `pages` (per app, default 2) |

`app_id` accepts a numeric id (`284882215`), `"id284882215"`, or a full App Store URL such as `https://apps.apple.com/us/app/facebook/id284882215`. `country` is any 2-letter storefront code (`us`, `gb`, `de`, `jp`…).

All tools are read-only. Errors come back as MCP tool errors (`isError: true`) with a clear message prefixed `invalid_input`, `upstream_error` or `internal_error`.

## Pricing

This Actor uses **pay-per-event** pricing. You pay only for successful tool calls. Calls that fail validation or can't reach Apple are not charged. Current prices are on the Actor's **Pricing** tab.

| Event | Price | When it's charged | Count |
|---|---|---|---|
| `search-apps` | $0.002 | Each successful `search_apps` call | 1 per call |
| `review` | $0.001 | Each review returned by `get_app_reviews` | 1 per review in the response (e.g. 50 reviews = 50 events; 0 reviews = no charge) |
| `review-insights` | $0.03 | Each successful `review_insights` call | 1 per call, flat. Reviews analyzed internally are **not** charged as `review` events. |
| `compare-apps` | $0.05 | Each successful `compare_apps` call | 1 per call, flat, however many apps or reviews are involved |

**Tip:** if you only need aggregates, `review_insights` and `compare_apps` are much cheaper than pulling hundreds of raw reviews with `get_app_reviews`.

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
- "Show the average rating per version for Instagram across us, gb and ca. Did the latest release make things worse?"
- "Compare Spotify, Apple Music and YouTube Music on recent reviews and tell me each one's biggest complaint."

## Example outputs

These excerpts come from real calls (October 2026).

**`search_apps`** `{ "term": "instagram", "limit": 5 }`

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,583,259 | 450.1.0 |
| 835599320 | TikTok - Videos, Shop & LIVE | TIKTOK PTE. LTD. | 4.72 | 18,388,560 | 47.1.0 |
| 447188370 | Snapchat | Snap, Inc. | 4.51 | 5,959,258 | 14.27.0.54 |
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,709,088 | 582.0.0 |

**`get_app_reviews`** `{ "app_id": "284882215", "pages": 2 }`, which is 100 reviews and charged as 100 `review` events:

```json
{
  "appId": "284882215",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 2,
  "pagesFetched": 2,
  "count": 100,
  "reviews": [
    {
      "id": "14650422444",
      "author": "SKILLEDTOMATO",
      "rating": 2,
      "title": "Stop auto refresh",
      "body": "Stop auto refreshing my feeds",
      "version": "582.0.0",
      "date": "2026-10-10T09:26:21-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    }
  ]
}
```

**`review_insights`** `{ "app_id": "284882215", "countries": ["us", "gb"], "pages": 3 }` (summary):

- Sample: 300 recent reviews (us 150, gb 150), 2026-10-01 → 2026-10-10. Store rating 4.53 over 28.7M ratings, but the sample average is **2.93**.
- Rating by version: `582.0.0` averages 3.10 (43.8% negative); `581.0.0` averages 2.57 (59.8% negative).
- Top complaints (n=147 negative reviews): **ads** (23 reviews), **friends** (17), **post** (15), **reels** (13), **ai** (13), **account** (9), **marketplace** (8)…
- Quotes, each with rating, title, text, version, country and date:
  > ★ **Trash**: "Hundreds of ads instead of seeing what my friends post…" (v582.0.0, us)

**`compare_apps`** `{ "app_ids": ["284882215", "389801252"], "pages": 2 }` (trimmed):

```json
{
  "country": "us",
  "apps": [
    { "id": "284882215", "name": "Facebook", "storeAverageRating": 4.53, "storeRatingCount": 28709088,
      "recentReviewSample": 100, "recentAverageRating": 3.02, "recentNegativeShare": 0.44,
      "latestVersionAverageRating": 3.02,
      "topComplaints": [{ "phrase": "ads", "reviews": 8 }, { "phrase": "friends", "reviews": 6 }] },
    { "id": "389801252", "name": "Instagram", "storeAverageRating": 4.69, "storeRatingCount": 29583259,
      "recentReviewSample": 100, "recentAverageRating": 2.07, "recentNegativeShare": 0.72,
      "latestVersionAverageRating": 2.07,
      "topComplaints": [{ "phrase": "reels", "reviews": 21 }, { "phrase": "ipad", "reviews": 20 }] }
  ],
  "leaders": {
    "storeAverageRating": { "id": "389801252", "name": "Instagram", "value": 4.69 },
    "recentAverageRating": { "id": "284882215", "name": "Facebook", "value": 3.02 },
    "lowestRecentNegativeShare": { "id": "284882215", "name": "Facebook", "value": 0.44 }
  }
}
```

## How complaint keywords are found

The method is transparent and deterministic. It uses no LLM and no black-box model:

1. Tokenize the title and body of each 1–2★ review.
2. Build 1-, 2- and 3-word phrases made only of content words. Stopwords, review boilerplate ("app", "update", "star"…), numbers and words from the app's own name or developer are excluded.
3. Rank phrases by **how many reviews mention them**, then by total mentions, so one long rant can't dominate.
4. Drop redundant short phrases that a longer phrase already covers, such as "crashing" when "keeps crashing" covers it.
5. Attach an example snippet for each phrase.

## Limitations

- **At most 500 reviews per app, storefront and sort order.** Apple's public review feed serves 10 pages of 50 reviews. Insights describe *recent written reviews*, not the whole rating population. The store-wide average and rating count are reported separately.
- **No historical archive.** The server returns what Apple serves now. To track trends over months, store results on your side.
- **iOS / Mac App Store only.** Google Play is not supported.
- **No developer replies** and no rating-only (unwritten) reviews. Apple's feed doesn't include them.
- **Unofficial endpoints.** Apple's iTunes Search/Lookup APIs and RSS feed are public but undocumented for this use, so they can change or rate-limit. The server retries with backoff, caches responses for 5 minutes, and returns partial results with `warnings` when one page or storefront fails.
- **English-centric keywords.** Reviews in any language are returned and counted, but the stopword list for complaint keywords is English.

## FAQ

**Do I need an Apple developer account or API key?**
No. All data comes from Apple's public endpoints. You only need an Apify account and token to call this hosted server.

**Can I analyze apps I don't own?**
Yes. Any app listed on the App Store works, including competitors' apps.

**Why is the sample average so different from the store rating?**
The store rating covers every rating the app has ever had, including the many silent 5★ taps. The sample covers only the most recent *written* reviews, and people who write reviews are more often unhappy. The gap is useful: a sharp drop in the recent average usually points to a problem in a recent release.

**How many reviews does `review_insights` analyze?**
`pages × 50` per storefront, up to 500 per country. With `pages: 10` and 10 countries, that's up to 5,000 reviews in one call, charged as a single `review-insights` event.

**Which countries are supported?**
Any App Store storefront, by its 2-letter code. Reviews are separate per storefront, so pass several countries to `review_insights` for wider coverage.

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
npm test               # build + end-to-end smoke test against live Apple endpoints
```

| env var | default | purpose |
|---|---|---|
| `PORT` / `HOST` | `3000` / `127.0.0.1` | HTTP bind (`--http`); also `--port`, `--host` |
| `HTTP_TIMEOUT_MS` | `15000` | per-request timeout to Apple |
| `HTTP_MAX_RETRIES` | `2` | retries on 408/425/429/5xx/network errors |
| `CACHE_TTL_MS` | `300000` | in-memory cache TTL (`0` disables) |
| `BILLING` | _(unset)_; `apify` in the Docker image | `apify` enables `Actor.charge()` pay-per-event billing |

**On Apify (Standby mode).** When `APIFY_IS_AT_HOME` is set, the server calls `Actor.init()`, forces HTTP mode, and listens on `0.0.0.0:$ACTOR_WEB_SERVER_PORT`, falling back to `ACTOR_STANDBY_PORT`, then `PORT`. `GET /` answers the Standby readiness probe and MCP is served at `/mcp`. The HTTP server has no authentication of its own: on Apify, the platform authenticates requests with your API token. If you self-host it beyond localhost, put it behind an auth proxy.

```
.actor/        actor.json, input_schema.json (empty), output_schema.json (MCP endpoint)
Dockerfile     apify/actor-node:20, multi-stage TypeScript build, BILLING=apify
src/
  index.ts     entry: stdio or stateless Streamable HTTP; Apify Standby wiring
  server.ts    MCP tool registrations (zod schemas, error mapping, billing)
  itunes.ts    Apple API client: timeout, retry, cache, feed parsing
  insights.ts  distribution, by-version stats, n-gram keywords, quote sampling
  billing.ts   chargeEvent() → Actor.charge() when BILLING=apify
  util.ts      errors, cache, concurrency limiter, input normalization
test/smoke.mjs end-to-end test via the MCP SDK client (stdio + HTTP)
```

## License

MIT
