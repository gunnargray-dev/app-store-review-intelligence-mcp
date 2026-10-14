# Example workflows

Four ways product, growth and indie teams use the App Store & Google Play Review Intelligence MCP server. Each one lists the prompt to give your agent, the tool calls it makes, what it costs on the [hosted server](https://apify.com/parallelstudio/app-store-review-intelligence-mcp), and a real (trimmed) result. The results come from live calls made on October 13–14, 2026; full responses are in [`demo/examples.json`](../demo/examples.json).

Set up your client first: see [Connect your MCP client](../README.md#connect-your-mcp-client).

---

## 1. Release check: did our last update make things worse?

**When:** a day or two after you ship, or when a rating dip shows up and you want to know why.

**Prompt**

> Did Duolingo's latest iOS release make things worse? Pool the us, gb and ca storefronts and quote the complaints that grew.

**Calls:** one `review_insights` with `{ "app_id": "570060128", "countries": ["us", "gb", "ca"], "pages": 2 }`.
**Cost:** $0.03 (flat, however many reviews it reads).

**Result (trimmed):**

```json
{
  "sample": { "reviews": 300, "negativeReviews": 71, "byCountry": { "us": 100, "gb": 100, "ca": 100 } },
  "ratingDistribution": { "average": 3.79, "total": 300 },
  "storeRating": { "averageRating": 4.72, "ratingCount": 5504507 },
  "versionDeltas": {
    "latest":   { "label": "7.144.0", "reviews": 122, "averageRating": 3.72, "negativeShare": 0.238 },
    "previous": { "label": "previous version 7.143.1", "reviews": 148, "averageRating": 3.9, "negativeShare": 0.223 },
    "change": { "averageRating": -0.18, "negativeShare": 0.015 },
    "confidence": "medium",
    "summary": "Version 7.144.0 (122 reviews) average 3.72★ vs 3.90★ for previous version 7.143.1 (148 reviews), −0.18; negative share 23.8% vs 22.3% (+1.5 pp). Rising complaints: \"learning\" (+15.5 pp, 27.6% of negative reviews), \"energy\" (+14.6 pp, 20.7% of negative reviews), \"ad\" (+10.8 pp, 13.8% of negative reviews)."
  }
}
```

The rising phrases come with quotes. For "energy" (21% of 1–2★ reviews on 7.144.0, up from 6%): *"…2 very short lessons a day (because get 21 energy each day and a lesson costs like 10)…"*. For "ad": *"Every time you finish a lesson, you now have to go through an ad…"*.

**How to read it:** a small rating drop with a sharp rise in one or two phrases usually points to a specific change (here, the energy system and post-lesson ads) rather than a broken build. If `confidence` is `low`, ask for more `pages` or `countries`.

**Your own app:** pass `since_version` to compare against a specific earlier release, for example the last one before a redesign.

---

## 2. Competitor teardown before a roadmap or pricing decision

**When:** you're scoping a feature, entering a category, or rethinking a paywall and want to know where competitors' users are unhappy.

**Prompt**

> Find the top habit tracker apps on the App Store and compare the leading ones on recent reviews. Which one has the happiest users, and what does each one get complained about?

**Calls:** `search_apps` `{ "term": "habit tracker", "limit": 5 }`, then `compare_apps` with the ids it picks, for example `{ "app_ids": ["1438388363", "1547137474", "1528595748"], "pages": 2 }`.
**Cost:** $0.002 + $0.05.

**Result (`compare_apps`, trimmed):**

| App | Store rating | Ratings | Recent avg (100 reviews) | Negative share | Top complaints |
|---|---|---|---|---|---|
| Habit Tracker (Inner Grow) | 4.79 | 147,904 | 4.01 | 22% | pay, years, stopped working |
| Onrise: Habit Tracker & Focus | 4.84 | 2,589 | 4.40 | 6% | feature, create, months |
| Finch: Self-Care Pet | 4.95 | 763,560 | 4.69 | 5% | items, week, refund |

`leaders` names Finch on every metric. The biggest store rating doesn't tell you much here. The useful signal is that the category leader by volume has 22% negative recent reviews, mostly about paying (and paying again after years of use) and things that stopped working.

**Tip:** apps with very few written reviews can come back with an empty recent sample. Swap in another candidate from `search_apps`, or add `country` storefronts where the app is popular.

---

## 3. iOS vs Android: are users on one platform unhappier?

**When:** you ship on both stores and want to know whether a problem is platform-specific.

**Prompt**

> Compare Duolingo on iOS and Android. Which platform's users are unhappier right now, and about what?

**Calls:** one `compare_apps` with mixed ids: `{ "app_ids": ["570060128", "com.duolingo"], "pages": 2 }`.
**Cost:** $0.05.

**Result (trimmed):**

| Platform | Store rating | Ratings | Recent avg (100 reviews) | Negative share | Top complaints |
|---|---|---|---|---|---|
| iOS (7.144.0) | 4.72 | 5,504,507 | 3.73 | 23% | learning, lesson, energy, game, ruined |
| Android | 4.74 | 50,941,319 (500M+ installs) | 4.50 | 10% | lessons, learning, ads, streak, energy |

Both stores mention the same themes, but iOS reviewers are much harder on the new release: 23% negative vs 10%, with "ruined" in the top five. That pattern points at something in the iOS build or its rollout, not the product overall.

---

## 4. Weekly review watch in Claude Code

**When:** you want a short Monday note on your app (or a competitor) without opening the stores.

Add the server once:

```bash
claude mcp add --transport http app-store-reviews \
  https://parallelstudio--app-store-review-intelligence-mcp.apify.actor/mcp \
  --header "Authorization: Bearer $APIFY_TOKEN"
```

Then schedule a headless run, for example with cron every Monday at 8:00:

```cron
0 8 * * 1  cd ~/review-watch && claude -p "Use the app-store-reviews tools. Run review_insights for app 570060128 with countries us, gb, ca and for com.duolingo. In under 150 words: what changed since the previous version, the top 3 complaints with one quote each, and anything that got worse. If nothing is notable, say so in one line." --allowedTools "mcp__app-store-reviews__review_insights" > "notes/$(date +\%F).md"
```

**Cost:** two `review_insights` calls, $0.06 per week.

Swap in your own app ids, or add a `compare_apps` call against your two closest competitors for $0.05 more.

---

## Picking the right tool

- **Summaries, complaints, "what broke":** `review_insights`. One flat-priced call, even for 5,000 reviews.
- **Several apps side by side:** `compare_apps` (2–10 apps, Apple and Google mixed).
- **Exact review text to quote or run your own analysis on:** `get_app_reviews`, billed per review returned.
- **Don't know the id:** `search_apps` with `store: "google"` for Android.
