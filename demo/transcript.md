# app-review-intel-mcp — smoke test transcript

Generated 2026-10-27T22:11:41.162Z by `test/smoke.mjs` against live Apple and Google Play endpoints. Server: **app-review-intel-mcp 1.1.3** over stdio.

**Assertions: 103/103 passed.**

## Tools

- **`search_apps`** — Find apps by name or keyword and get the app id the other tools need. Returns id (Apple numeric id or Google Play package name), name, developer, rating, rating count, price, genre, current version, store URL (Google adds installs). Use when the user names an app ("Duolingo", "Calm") or a category ("budget apps"). Set store: "google" for Android/Google Play. Cheap, one call. Next: review_insights or compare_apps.
  - params: `term`* (string), `store` (string), `lang` (string), `country` (string), `limit` (integer)
- **`get_app_reviews`** — Fetch raw reviews for one app: rating, title (Apple only), text, app version, date, helpful votes (Google adds developer replies). Use when the user wants to read or quote actual reviews or you need text for custom analysis. For summaries, complaints or "what broke", call review_insights instead: it is one flat-priced call. Billed per review returned (~50 per page; default 1 page). Max 10 pages ≈ 500 reviews.
  - params: `app_id`* (integer|string), `store` (string), `lang` (string), `country` (string), `pages` (integer), `sort` (string)
- **`review_insights`** — Best first call for any question about an app's user feedback. Analyses recent reviews and returns: rating distribution, average rating per app version, top complaint phrases from 1-2★ reviews (share + example quote), versionDeltas (latest version vs earlier: rating change, negative-share change, rising complaints with quotes; falls back to last 3 days vs earlier), and sample quotes. Use for "why are users unhappy with X", "what broke in the last update", "top complaints about X", "summarize feedback". One flat price per call regardless of pages/countries. For the review text itself use get_app_reviews; to benchmark several apps at once use compare_apps. Apple and Google Play.
  - params: `app_id`* (integer|string), `store` (string), `lang` (string), `countries` (array), `pages` (integer), `since_version` (string), `keyword_limit` (integer), `quotes` (integer)
- **`compare_apps`** — Benchmark 2-10 apps in one storefront for competitor analysis: store rating, rating count, price, current version & release date (Google adds installs), plus recent-review metrics (sample average, % negative / positive, latest-version average, top 5 complaints) and per-metric leaders. Apple ids and Google Play package names can be mixed (e.g. iOS vs Android of the same app). Examples: "Notion vs Evernote", "which meditation app has the happiest users". One flat price per call. Get ids from search_apps first. For one app in depth (version deltas, more quotes) use review_insights instead.
  - params: `app_ids`* (array), `country` (string), `lang` (string), `pages` (integer)

## Calls

### `search_apps` ⚠️ (error)

Arguments: `{"term":"instagram","store":"google"}` · 5 ms

> MCP error -32602: Input validation error: Invalid arguments for tool search_apps: Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today. at store

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"com.spotify.music"}` · 2 ms

> Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"https://play.google.com/store/apps/details?id=com.instagram.android"}` · 1 ms

> Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.

### `review_insights` ⚠️ (error)

Arguments: `{"app_id":"com.instagram.android"}` · 1 ms

> Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.

### `review_insights` ⚠️ (error)

Arguments: `{"app_id":"284882215","store":"google"}` · 2 ms

> MCP error -32602: Input validation error: Invalid arguments for tool review_insights: Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today. at store

### `compare_apps` ⚠️ (error)

Arguments: `{"app_ids":["284882215","com.spotify.music"]}` · 2 ms

> Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"not-an-id"}` · 1 ms

> Error (invalid_input): Invalid app_id "not-an-id". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.

### `search_apps` 

Arguments: `{"term":"instagram","country":"us","limit":5}` · 72 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,644,344 | 453.0 |
| 835599320 | TikTok - Videos, Shop & LIVE | TIKTOK PTE. LTD. | 4.72 | 18,407,475 | 47.5.0 |
| 447188370 | Snapchat | Snap, Inc. | 4.51 | 6,044,782 | 14.29.0.57 |
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,928,101 | 584.1 |
| 544007664 | YouTube | Google LLC | 4.66 | 49,609,276 | 21.42.4 |

<details><summary>Raw response</summary>

```json
{
  "term": "instagram",
  "store": "apple",
  "country": "us",
  "count": 5,
  "apps": [
    {
      "id": "389801252",
      "name": "Instagram",
      "developer": "Instagram, Inc.",
      "developerId": "389801255",
      "bundleId": "com.burbn.instagram",
      "genre": "Photo & Video",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.69,
      "ratingCount": 29644344,
      "currentVersionAverageRating": 4.69,
      "currentVersionRatingCount": 29644344,
      "version": "453.0",
      "currentVersionReleaseDate": "2026-10-26T12:40:24Z",
      "releaseDate": "2010-10-06T08:12:41Z",
      "contentRating": "12+",
      "sizeBytes": 671668224,
      "minimumOsVersion": "16.3",
      "url": "https://apps.apple.com/us/app/instagram/id389801252",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/44/b0/cc/44b0cc3a-e91f-2824-d98f-3e5e095a73f3/Prod-0-0-1x_U007epad-0-0-0-1-0-0-sRGB-85-220.png/512x512bb.jpg",
      "description": "Little moments lead to big friendships. Share yours on Instagram. — From Meta Connect with friends, find other fans, and see what people around you are up to and into. Explore your interests and post what's going on, from your daily moments to life's highlights. Share what you’re up to and into: -…"
    },
    {
      "id": "835599320",
      "name": "TikTok - Videos, Shop & LIVE",
      "developer": "TIKTOK PTE. LTD.",
      "developerId": "1322881000",
      "bundleId": "com.zhiliaoapp.musically",
      "genre": "Entertainment",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.72,
      "ratingCount": 18407475,
      "currentVersionAverageRating": 4.72,
      "currentVersionRatingCount": 18407475,
      "version": "47.5.0",
      "currentVersionReleaseDate": "2026-10-26T21:46:05Z",
      "releaseDate": "2014-04-02T22:44:45Z",
      "contentRating": "12+",
      "sizeBytes": 1072171008,
      "minimumOsVersion": "15.0",
      "url": "https://apps.apple.com/us/app/tiktok-videos-shop-live/id835599320",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/19/60/31/1960312d-f882-d651-6ea6-53a3179dee9b/TikTok_AppIcon26-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
      "description": "TikTok is the global discovery platform for videos, streaming on LIVE, shopping, and more. Our mission is to inspire creativity and bring joy. Over a billion people come to TikTok to share what they love, learn new things, and find ideas that make everyday life more interesting. Your experience on…"
    },
    {
      "id": "447188370",
      "name": "Snapchat",
      "developer": "Snap, Inc.",
      "developerId": "446889612",
      "bundleId": "com.toyopagroup.picaboo",
      "genre": "Photo & Video",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.51,
      "ratingCount": 6044782,
      "currentVersionAverageRating": 4.51,
      "currentVersionRatingCount": 6044782,
      "version": "14.29.0.57",
      "currentVersionReleaseDate": "2026-10-21T11:02:14Z",
      "releaseDate": "2011-07-13T23:51:40Z",
      "contentRating": "12+",
      "sizeBytes": 424671232,
      "minimumOsVersion": "15.0",
      "url": "https://apps.apple.com/us/app/snapchat/id447188370",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/b7/86/e1/b786e10d-8be0-20c7-6978-8d3c13c24a90/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
      "description": "Snapchat is a fast and fun way to share the moment with your friends and family SNAP • Snapchat opens right to the Camera — just tap to take a photo, or press and hold for video. • Express yourself with Lenses, Filters, Bitmoji and more! • Try out new Lenses daily created by the Snapchat…"
    },
    {
      "id": "284882215",
      "name": "Facebook",
      "developer": "Meta Platforms, Inc.",
      "developerId": "284882218",
      "bundleId": "com.facebook.Facebook",
      "genre": "Social N
… (truncated, 2291 more chars — see transcript.json)
```

</details>

### `search_apps` 

Arguments: `{"term":"facebook","limit":3}` · 21 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,928,101 | 584.1 |
| 454638411 | Messenger | Meta Platforms, Inc. | 4.66 | 13,879,941 | 584.0.0 |
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,644,344 | 453.0 |

<details><summary>Raw response</summary>

```json
{
  "term": "facebook",
  "store": "apple",
  "country": "us",
  "count": 3,
  "apps": [
    {
      "id": "284882215",
      "name": "Facebook",
      "developer": "Meta Platforms, Inc.",
      "developerId": "284882218",
      "bundleId": "com.facebook.Facebook",
      "genre": "Social Networking",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.53,
      "ratingCount": 28928101,
      "currentVersionAverageRating": 4.53,
      "currentVersionRatingCount": 28928101,
      "version": "584.1",
      "currentVersionReleaseDate": "2026-10-23T09:58:23Z",
      "releaseDate": "2019-02-05T08:00:00Z",
      "contentRating": "12+",
      "sizeBytes": 529373184,
      "minimumOsVersion": "15.1",
      "url": "https://apps.apple.com/us/app/facebook/id284882215",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/5d/a6/7a/5da67a2d-6bdd-b95b-86d7-a201d6979b35/Icon-Production-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
      "description": "Where real people propel your curiosity. Whether you’re thrifting gear, showing reels to that group who gets it, or sharing laughs over fun images reimagined by AI, Facebook helps you make things happen like no other social network. Explore and expand your interests: * Shop Marketplace for hidden…"
    },
    {
      "id": "454638411",
      "name": "Messenger",
      "developer": "Meta Platforms, Inc.",
      "developerId": "284882218",
      "bundleId": "com.facebook.Messenger",
      "genre": "Social Networking",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.66,
      "ratingCount": 13879941,
      "currentVersionAverageRating": 4.66,
      "currentVersionRatingCount": 13879941,
      "version": "584.0.0",
      "currentVersionReleaseDate": "2026-10-17T16:36:30Z",
      "releaseDate": "2011-08-09T19:49:28Z",
      "contentRating": "12+",
      "sizeBytes": 294721536,
      "minimumOsVersion": "15.1",
      "url": "https://apps.apple.com/us/app/messenger/id454638411",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/29/c1/59/29c15941-228e-4139-22f7-2b0c6adf49b2/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
      "description": "Messenger is a free messaging app that helps you connect with anyone, anywhere. Stay in touch with your friends and family, explore your interests with people like you, build your community, and share your vibe beyond words, all in one app. CHAT AND CALL ANYONE, ANYWHERE Find and connect with your…"
    },
    {
      "id": "389801252",
      "name": "Instagram",
      "developer": "Instagram, Inc.",
      "developerId": "389801255",
      "bundleId": "com.burbn.instagram",
      "genre": "Photo & Video",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.69,
      "ratingCount": 29644344,
      "currentVersionAverageRating": 4.69,
      "currentVersionRatingCount": 29644344,
      "version": "453.0",
      "currentVersionReleaseDate": "2026-10-26T12:40:24Z",
      "releaseDate": "2010-10-06T08:12:41Z",
      "contentRating": "12+",
      "sizeBytes": 671668224,
      "minimumOsVersion": "16.3",
      "url": "https://apps.apple.com/us/app/instagram/id389801252",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/44/b0/cc/44b0cc3a-e91f-2824-d98f-3e5e095a73f3/Prod-0-0-1x_U007epad-0-0-0-1-0-0-sRGB-85-220.png/512x512bb.jpg",
      "description": "Little moments lead to big friendships. Share yours on Instagram. — From Meta Connect with friends, find other fans, and see what people around you are up to and into. Explore your interests and post what's going on, from your daily moments to life's highlights. Share what you’re up to and into: -…"
    }
  ]
}
```

</details>

### `search_apps` 

Arguments: `{"term":"instagram","store":"google","limit":5}` · 290 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| com.instagram.android | Instagram | Instagram | 3.99 | 169,486,506 | – |
| com.instagram.airwave | Instagram | Instagram | 3.86 | 5,000,000+ | – |
| com.instagram.barcelona | Threads | Instagram | 4 | 500,000,000+ | – |
| com.instagram.moonshot | Instants, an Instagram app | Instagram | 4.58 | 5,000,000+ | – |
| com.snapchat.android | Snapchat | Snap Inc | 4.18 | 1,000,000,000+ | – |

<details><summary>Raw response</summary>

```json
{
  "term": "instagram",
  "store": "google",
  "country": "us",
  "count": 5,
  "apps": [
    {
      "id": "com.instagram.android",
      "name": "Instagram",
      "developer": "Instagram",
      "developerId": "Instagram",
      "bundleId": "com.instagram.android",
      "genre": "Social",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 3.99,
      "ratingCount": 169486506,
      "contentRating": "Teen",
      "url": "https://play.google.com/store/apps/details?id=com.instagram.android",
      "icon": "https://play-lh.googleusercontent.com/yHi59jmO_lVamcyJ1i3rM1_E8bAiAspShnGjjURq05ipQQSUksO3QVEsXTegRSqul038-4YNA7O644XAcx251Q",
      "description": "Little moments lead to big friendships. Share yours on Instagram. —From Meta Connect with friends, find other fans, and see what people around you are up to and into. Explore your interests and post what's going on, from your daily moments to life's highlights. Share what you’re up to and into on…",
      "installs": "5,000,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.instagram.airwave",
      "name": "Instagram",
      "developer": "Instagram",
      "bundleId": "com.instagram.airwave",
      "genre": "Social",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 3.86,
      "contentRating": "Teen",
      "url": "https://play.google.com/store/apps/details?id=com.instagram.airwave",
      "icon": "https://play-lh.googleusercontent.com/bh871pyeIpMnJxGYKmTJCm-5VwIYrPUYhHQcCky0B-DpsMoPCWVSDKz0Ic7MLsGuLmS4F_-iE6BilqsUM2DloA",
      "description": "Instagram, now on your TV. Watch the creators and content you love on Instagram, now on the biggest screen in your home. Enjoy Reels, watch longer videos with friends, catch live shows, and discover something new, all from your TV. - Watch your favorite creators on the big screen - Discover…",
      "installs": "5,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.instagram.barcelona",
      "name": "Threads",
      "developer": "Instagram",
      "bundleId": "com.instagram.barcelona",
      "genre": "Social",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4,
      "contentRating": "Teen",
      "url": "https://play.google.com/store/apps/details?id=com.instagram.barcelona",
      "icon": "https://play-lh.googleusercontent.com/6PzXaP0KaRU4DifAfsXKbWNVA3JPrP9uklvEh5EDhzPRdPfHV4tzszhAavQa4bq0YGdbnphBucz9vEUXiu1Ebg",
      "description": "Say more with Threads — Instagram’s text-based conversation app. Threads is where communities come together to discuss everything from the topics you care about today to what’ll be trending tomorrow. Whatever it is you’re interested in, you can follow and connect directly with your favorite…",
      "installs": "500,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.instagram.moonshot",
      "name": "Instants, an Instagram app",
      "developer": "Instagram",
      "bundleId": "com.instagram.moonshot",
      "genre": "Social",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.58,
      "contentRating": "Teen",
      "url": "https://play.google.com/store/apps/details?id=com.instagram.moonshot",
      "icon": "https://play-lh.googleusercontent.com/jY3m_SwenXTDzXJFno6H3LYVEUSXGOuDoHQcpuonuq3_kEMsc6nGCo3ytPN1oULjwqpmLMXKUmppOuRDa1DqmA",
      "description": "Introducing Instants, a new app from Instagram. Share everyday moments — not just the highlights. -Real life, real quick. Jump straight to the camera and share with a tap — no edits, no overthinking. -Here and now. Instants can’t be viewed again once they’re gone. -Use either app. Share and view…",
      "installs": "5,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.snapchat.android",
      "name": "Snapchat",
      "developer": "S
… (truncated, 848 more chars — see transcript.json)
```

</details>

### `search_apps` 

Arguments: `{"term":"meditation","store":"google","limit":8}` · 319 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| com.spotlightsix.zentimerlite2 | Insight Timer - Meditation App | Insight Network Inc | 4.7 | 10,000,000+ | – |
| meditofoundation.medito | Medito: Meditation & Sleep | Medito for Mindfulness, Meditation and Sleep | 4.78 | 1,000,000+ | – |
| com.getsomeheadspace.android | Headspace: Sleep & Meditation | Headspace for Meditation, Mindfulness and Sleep | 4.25 | 10,000,000+ | – |
| com.elevatelabs.geonosis | Balance: Meditation & Sleep | The Mind Company | 4.63 | 1,000,000+ | – |
| uk.co.serenity.guided.meditation | Serenity: Guided Meditation | Olson Meditation and Mindfulness Apps | 4.83 | 1,000,000+ | – |
| com.simplehabit.simplehabitapp | Simple Habit: Meditation | Ingenio, LLC | 4.59 | 1,000,000+ | – |
| com.calm.android | Calm - Sleep, Meditate, Relax | Calm.com, Inc. | 4.48 | 50,000,000+ | – |
| com.subconscious.thrive | Atom: Meditation for Beginners | Atom : Being Present | 4.72 | 1,000,000+ | – |

<details><summary>Raw response</summary>

```json
{
  "term": "meditation",
  "store": "google",
  "country": "us",
  "count": 8,
  "apps": [
    {
      "id": "com.spotlightsix.zentimerlite2",
      "name": "Insight Timer - Meditation App",
      "developer": "Insight Network Inc",
      "bundleId": "com.spotlightsix.zentimerlite2",
      "genre": "Health & Fitness",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.7,
      "contentRating": "Everyone",
      "url": "https://play.google.com/store/apps/details?id=com.spotlightsix.zentimerlite2",
      "icon": "https://play-lh.googleusercontent.com/H7MMtGtHuKqoT73wpfXXuqBgufaw3k03jUG58cqwJ1KITPU6nY8c1cvdAYCNcZY7xRwKwi-G3W6yltje3VbMnfY",
      "description": "The world’s most popular wellness app. * Apps of the Year Winner - TIME magazine and Women's Health * * More time is spent on Insight Timer than on all other wellbeing apps combined * * Happiest App in the World - Tristan Harris * The number 1 free meditation app. Guided meditations, sleep music…",
      "installs": "10,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "meditofoundation.medito",
      "name": "Medito: Meditation & Sleep",
      "developer": "Medito for Mindfulness, Meditation and Sleep",
      "bundleId": "meditofoundation.medito",
      "genre": "Health & Fitness",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.78,
      "contentRating": "Everyone",
      "url": "https://play.google.com/store/apps/details?id=meditofoundation.medito",
      "icon": "https://play-lh.googleusercontent.com/3GKenq_HBUYKA__-5oSy9wU0n3wWUYvaqcDg-tu3Di9MwsXkyPD9Gu3pdx9M8WJ8hK4bsfxKSdNTtckeKycywg",
      "description": "Free Meditation & Sleep Made Easy — Always Free. Join 4 million+ people finding calm with Medito, your pocket‑size studio for guided meditation, mindfulness courses, breathing exercises and sleep stories. No ads. No subscriptions. Pure daily calm. Medito’s meditations, mindfulness & breathing…",
      "installs": "1,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.getsomeheadspace.android",
      "name": "Headspace: Sleep & Meditation",
      "developer": "Headspace for Meditation, Mindfulness and Sleep",
      "bundleId": "com.getsomeheadspace.android",
      "genre": "Health & Fitness",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.25,
      "contentRating": "Everyone",
      "url": "https://play.google.com/store/apps/details?id=com.getsomeheadspace.android",
      "icon": "https://play-lh.googleusercontent.com/kp_QagG6AodramfhZ7-ErzFuA86QOUAZDIYl5KlBlnPr0Lb_ys98unvi5Ej_MWo5Kr8TRIkNz46IxISRyXot",
      "description": "Headspace is your guide to mental health, mindfulness, and meditation. Access guided meditations, mindfulness tools, therapy for anxiety, mental health coaching, and Ebb, your AI companion for meditation & sleep support. Manage emotions and anxiety, and follow your mental health journey with…",
      "installs": "10,000,000+",
      "currentVersionAverageRating": null
    },
    {
      "id": "com.elevatelabs.geonosis",
      "name": "Balance: Meditation & Sleep",
      "developer": "The Mind Company",
      "bundleId": "com.elevatelabs.geonosis",
      "genre": "Health & Fitness",
      "price": 0,
      "formattedPrice": "Free",
      "currency": "USD",
      "averageRating": 4.63,
      "contentRating": "Everyone",
      "url": "https://play.google.com/store/apps/details?id=com.elevatelabs.geonosis",
      "icon": "https://play-lh.googleusercontent.com/L2T8QvQ-2Bjko4G2-OFYrbxR9ar3dvvXsIwB-G7nQSMzRr3aB9s9o8gLDBjaOAn6JgLuwu2KcD8EYht8kJTx",
      "description": "Get support for whatever 2026 brings and build habits for lifelong mental health. Enhance your mental health, reduce daily anxiety and stress, improve your sleep, and increase focus with the Balance Meditation and Sleep app. Balance is a personalized program, like having a per
… (truncated, 4067 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"284882215","country":"us","pages":2,"sort":"mostrecent"}` · 345 ms

App **284882215** (apple) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★★★★ | 584.1 | 2026-10-26 | A tool!!! | Facebook can be used as an excellent tool in the right hands 💪🏾 |
| ★★★★★ | 584.1 | 2026-10-26 | Highly recommended | Have never listen to any therapist who explains symptoms and solutions on such ground level . Highly recommended a true soul person and ther… |
| ★ | 584.1 | 2026-10-26 | Ban acc cmm | Thề mà cái acc đang dùng ngon tự dưng ban cmn acc là thế nào? Sống hãm l thế, bộ kh biết nhìn lại cái mình làm à? Ở đó mà xét duyệt tài khoả… |
| ★★★★★ | 584.1 | 2026-10-26 | Facebook | I like face book |
| ★ | 584.1 | 2026-10-26 | Never Ending Interruption and Irrelevanance | I just want to catch up with Friends and follow my interests. However, Facebook bombards the user with constant advertising and irrelevant r… |

_(first 5 of 100 shown)_

<details><summary>Raw response</summary>

```json
{
  "appId": "284882215",
  "store": "apple",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 2,
  "pagesFetched": 2,
  "count": 100,
  "reviews": [
    {
      "id": "14713744080",
      "author": "Lightbulb Jr.",
      "rating": 5,
      "title": "A tool!!!",
      "body": "Facebook can be used as an excellent tool in the right hands 💪🏾",
      "version": "584.1",
      "date": "2026-10-26T06:55:52-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713731049",
      "author": "afifapyooo",
      "rating": 5,
      "title": "Highly recommended",
      "body": "Have never listen to any therapist who explains symptoms and solutions on such ground level . Highly recommended a true soul person and therapist 💓💓",
      "version": "584.1",
      "date": "2026-10-26T06:52:07-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713726921",
      "author": "convkcuaAven",
      "rating": 1,
      "title": "Ban acc cmm",
      "body": "Thề mà cái acc đang dùng ngon tự dưng ban cmn acc là thế nào? Sống hãm l thế, bộ kh biết nhìn lại cái mình làm à? Ở đó mà xét duyệt tài khoản cái dais, gửi cho cũng có mở đ đâu, toàn đ duyệt xong ban cmn acc vĩnh viễn.",
      "version": "584.1",
      "date": "2026-10-26T06:50:57-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713721449",
      "author": "Gorafira",
      "rating": 5,
      "title": "Facebook",
      "body": "I like face book",
      "version": "584.1",
      "date": "2026-10-26T06:49:23-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713700943",
      "author": "2 DEUCES",
      "rating": 1,
      "title": "Never Ending Interruption and Irrelevanance",
      "body": "I just want to catch up with Friends and follow my interests. However, Facebook bombards the user with constant advertising and irrelevant reels etc.  you have to be a masochist to get on this app because it punishes you the entire time you use it and even after.",
      "version": "584.1",
      "date": "2026-10-26T06:43:30-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713677894",
      "author": "Bejdjejehejebejshwu",
      "rating": 3,
      "title": "Anuncios",
      "body": "Mucho anuncios no como antes",
      "version": "584.1",
      "date": "2026-10-26T06:36:54-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713659759",
      "author": "Way to difficult",
      "rating": 2,
      "title": "Too many adds",
      "body": "It’s always trying to show me things I’ve already bought or have no interest in",
      "version": "584.1",
      "date": "2026-10-26T06:31:42-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713653595",
      "author": "Shade412 Productions",
      "rating": 1,
      "title": "This app sucks",
      "body": "Hate your app so much wish you would get shut down",
      "version": "584.1",
      "date": "2026-10-26T06:29:57-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713547618",
      "author": "Masump8",
      "rating": 1,
      "title": "Profile reel button",
      "body": "This app can not load all the reels of a profile,whats wrong with ipados facebook app?",
      "version": "584.1",
      "date": "2026-10-26T05:59:27-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713535800",
      "author": "Bando bullies",
      "rating": 5,
      "title": "Thank you",
      "body": "Thank you for allowing the rest of the world to use you guys‘s platform, which helps spray information gang information and keep families connected. Thank you very much.",
      "version": "584.1",
      "date": "2026-10-26T05:56:02-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713479340",
      "author": "frustrsted#2",
      "rating": 1,
      "title": "Not working",

… (truncated, 36291 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"389801252","country":"us","pages":2,"sort":"mostrecent"}` · 477 ms

App **389801252** (apple) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★★★★ | 453.0 | 2026-10-26 | Great | I love this app |
| ★ | 453.0 | 2026-10-26 | Bugs | So many bugs im about to be crazy |
| ★★★★★ | 453.0 | 2026-10-26 | Adding More Profile Pictures | why did you delete this feature?? it is the best thing ever. please add it back. im begging |
| ★★ | 453.0 | 2026-10-26 | Duo optimization only | I hope that what has been put out isn’t the final optimization for instagram on the duo. The bar on the right side of the screen is terrible… |
| ★ | 453.0 | 2026-10-26 | Trouble | Why i cant use instagram plus |

_(first 5 of 100 shown)_

<details><summary>Raw response</summary>

```json
{
  "appId": "389801252",
  "store": "apple",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 2,
  "pagesFetched": 2,
  "count": 100,
  "reviews": [
    {
      "id": "14713748258",
      "author": "BrianTheTruth",
      "rating": 5,
      "title": "Great",
      "body": "I love this app",
      "version": "453.0",
      "date": "2026-10-26T06:57:04-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713744034",
      "author": "Hotelindiaaaaaaaaaaaaaaaa",
      "rating": 1,
      "title": "Bugs",
      "body": "So many bugs im about to be crazy",
      "version": "453.0",
      "date": "2026-10-26T06:55:52-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713732942",
      "author": "Alwesy",
      "rating": 5,
      "title": "Adding More Profile Pictures",
      "body": "why did you delete this feature?? it is the best thing ever. please add it back. im begging",
      "version": "453.0",
      "date": "2026-10-26T06:52:40-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713727658",
      "author": "m4$$on",
      "rating": 2,
      "title": "Duo optimization only",
      "body": "I hope that what has been put out isn’t the final optimization for instagram on the duo. The bar on the right side of the screen is terrible and when opened in horizontal mode there’s so much wasted space.",
      "version": "453.0",
      "date": "2026-10-26T06:51:10-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713671761",
      "author": "바이옴 나무",
      "rating": 1,
      "title": "Trouble",
      "body": "Why i cant use instagram plus",
      "version": "453.0",
      "date": "2026-10-26T06:35:12-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713641477",
      "author": "Chococatinc",
      "rating": 1,
      "title": "Ai suggested search is a privacy invasion",
      "body": "The ai suggested search under a reel now shows the location which reduces privacy. There is no way to turn it off and I don’t want everyone knowing my potential location.",
      "version": "452.0.0",
      "date": "2026-10-26T06:26:27-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713615175",
      "author": "Patdalegend",
      "rating": 5,
      "title": "Thankful , Thank You Guys",
      "body": "I just think it’s a lifestyle ya know !! & if you treat it right it will in due time adapt & it’s your world whatever you put your mind to it comes to life Instagram been apart of a lot of journeys thanks for the support and memories and love",
      "version": "453.0",
      "date": "2026-10-26T06:18:54-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713527169",
      "author": "Diddy sophomore",
      "rating": 1,
      "title": "Hey ig",
      "body": "You ruined my life😓🙁",
      "version": "453.0",
      "date": "2026-10-26T05:53:28-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713509065",
      "author": "5674347",
      "rating": 1,
      "title": "over stepping",
      "body": "we should have a choice in if we are used for AI. looking for a new app",
      "version": "452.0.0",
      "date": "2026-10-26T05:48:06-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713496118",
      "author": "bitoonon",
      "rating": 1,
      "title": "Remove Ads",
      "body": "Get rid of these irrelevant ads, that provide no benefit to users. \n\nNo purpose in clicking “I’ve seen too many ads recently” because they continue to push even more ads, thereafter.",
      "version": "452.0.0",
      "date": "2026-10-26T05:44:15-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14713475719",
      "author": "Robb stark.",
      "rating": 1,
      "title": "it's awful",
      "body": "There is an issue in the DM’s because when I send a p
… (truncated, 37345 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"https://apps.apple.com/us/app/instagram/id389801252","sort":"mosthelpful"}` · 29 ms

App **389801252** (apple) · us · sort=mosthelpful · pages fetched 1/1 · **50 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★★★★ | 410.0.0 | 2025-12-21 | Questionable security and no human being to talk to about it! | I wouldn’t be writing this review, if I had been capable of talking to actual person! In the middle of the night, while I was asleep, someon… |
| ★★★★★ | 337.0.0 | 2024-07-01 | Creative and User-Enhancing Suggestions | Dear Instagram Developers, I hope this message finds you well. I am writing to offer a few suggestions that I believe would greatly benefit … |
| ★★★★★ | 297.0 | 2023-08-21 | My problem | Instagram is a really good app and I love it but I had a problem recently… Someone made an account pretending to be me they used one my pict… |
| ★★★★★ | 123.0 | 2019-12-18 | If I could give it zero stars I would | I had Instagram in the past and then deleted my old account. I made a new one recently and it has been a total nightmare. Worst app ever. I … |
| ★★★★★ | 86.0 | 2019-03-28 | Some things to fix | So there are MANY nsfw accounts on instagram....if you report it for sexual pornography it will say "we reviewed your report and found that … |

_(first 5 of 50 shown)_

<details><summary>Raw response</summary>

```json
{
  "appId": "389801252",
  "store": "apple",
  "country": "us",
  "sort": "mosthelpful",
  "pagesRequested": 1,
  "pagesFetched": 1,
  "count": 50,
  "reviews": [
    {
      "id": "13539617732",
      "author": "JJLin283",
      "rating": 5,
      "title": "Questionable security and no human being to talk to about it!",
      "body": "I wouldn’t be writing this review, if I had been capable of talking to actual person! In the middle of the night, while I was asleep, someone succeeded at hacking into one of my Instagram accounts…after only two failed attempts! At the time of the first two attempts, which, again, happened while I was asleep, Instagram sent codes to my phone. On the third attempt, a message was sent to me via WhatsApp, informing me that my account had been accessed. That was just after 2AM. \n\nWhen I discovered these messages, after I woke up, at around 8AM, I clicked on a link that required me to verify whether it was me who had logged in. I, of course, clicked on “This wasn’t me.” Nothing happened! Every time I tried clicking on that option, a message popped up saying, “Something went wrong. Please try again.” It just said that over and over again. I was horrified. I had two Instagram accounts. The one that was hacked into, I simply deleted because I wasn’t using it that much anyway. \n\nThe big problem is, the account that was hacked into was connected to my other, more important account, as well as my Facebook profile. I wonder what information the hacker stole! Lord knows, they had plenty of time to take whatever they wanted! The most I could do was chat with an AI bot about it! I gave this app two stars, instead of one, only because there is plenty about Instagram that I actually like, but what is it worth to have such a social media account when things like this can happen so easily?!",
      "version": "410.0.0",
      "date": "2025-12-21T10:38:52-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "11443389782",
      "author": "wucls",
      "rating": 5,
      "title": "Creative and User-Enhancing Suggestions",
      "body": "Dear Instagram Developers, I hope this message finds you well. I am writing to offer a few suggestions that I believe would greatly benefit and enhance the functionality of Instagram. Firstly, I propose the inclusion of a feature that would allow users to add music to their profiles. This addition would undoubtedly add a whole new dimension of creativity and personalization, empowering users to express themselves through their favorite tunes. Secondly, I would like to address a concern regarding the white circle that surrounds the profile photo. In my opinion, this visual element can sometimes disrupt the overall aesthetic and proportion of the photo. I respectfully suggest that the option to remove or customize this circle be made available, allowing users to further curate their profiles in alignment with their personal branding. Last but not least, I would like to express my desire for Instagram to support the option of using GIFs as profile photos. This animated form of self-expression would undoubtedly inject a playful and engaging element into users' profiles, increasing their appeal and individuality. I genuinely believe that these proposals could positively impact the Instagram user experience, fostering increased creativity and allowing for further personalization. I appreciate your time and consideration, and I eagerly look forward to seeing the continued evolution of the platform. Thank you for your attention to these suggestions.",
      "version": "337.0.0",
      "date": "2024-07-01T00:45:47-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "10283660915",
      "author": "KylaRay",
      "rating": 5,
      "title": "My problem",
      "body": "Instagram is a really good app and I love it but I had a problem recently… Someone made an account pretending to be me they used one my pictures from my page and used 
… (truncated, 84808 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"com.spotify.music","pages":2}` · 167 ms

App **com.spotify.music** (google) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★★★ | 9.1.92.3058 | 2026-10-26 |  | Updating my review after Spotify responded promptly to my feedback and provided guidance on managing ad preferences. I appreciate the quick … |
| ★★★★★ | 9.1.92.3058 | 2026-10-26 |  | semma 😍🥰❤️👍 |
| ★★★★★ | 9.1.92.3058 | 2026-10-26 |  | great |
| ★ | 9.1.88.2204 | 2026-10-26 |  | relax with your ads and stop adding on more ads already or else you going to lose lots of users because not everyone is as rich like you tho… |
| ★★★★★ | 9.1.92.3058 | 2026-10-26 |  | Glitchy lately. Playbar goes away. Cuts in and out (with good signal) . |

_(first 5 of 100 shown)_

<details><summary>Raw response</summary>

```json
{
  "appId": "com.spotify.music",
  "store": "google",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 2,
  "pagesFetched": 2,
  "count": 100,
  "reviews": [
    {
      "id": "cc1f333e-a00f-4a51-a295-653cf219beba",
      "author": "Erick Miguel",
      "rating": 4,
      "title": "",
      "body": "Updating my review after Spotify responded promptly to my feedback and provided guidance on managing ad preferences. I appreciate the quick response and willingness to help! My concern about explicit ads potentially reaching children remains, but good customer service deserves recognition. Hopefully, these controls help improve the experience. Raising my rating to 4 stars in appreciation of their response.",
      "version": "9.1.92.3058",
      "date": "2026-10-26T22:10:35.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0,
      "developerReply": "Hi. Thanks for feedback. You can now update your ad preferences. Just check out \"Managing your ad preferences\" at support.spotify.com or manage in-app by liking and disliking ads. If that doesn't help, we'd recommend reaching out to our Customer Service by searching for \"Contact Us\" on the same site."
    },
    {
      "id": "abe39806-a14f-4e19-bbb5-27ce8af13a1a",
      "author": "Sankar Muthu",
      "rating": 5,
      "title": "",
      "body": "semma 😍🥰❤️👍",
      "version": "9.1.92.3058",
      "date": "2026-10-26T22:00:40.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "52566833-a2ee-49a3-a266-5e4a40dc4940",
      "author": "German Vazquez",
      "rating": 5,
      "title": "",
      "body": "great",
      "version": "9.1.92.3058",
      "date": "2026-10-26T21:57:04.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "e267219d-b9d3-4a3a-89af-510cb32a53fe",
      "author": "Cyndi ʕ•ᴥ•ʔ",
      "rating": 1,
      "title": "",
      "body": "relax with your ads and stop adding on more ads already or else you going to lose lots of users because not everyone is as rich like you thought to subscribe every month. 🙄",
      "version": "9.1.88.2204",
      "date": "2026-10-26T21:56:15.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "ce37543b-bc23-47ee-aa4f-37e9202b7bc1",
      "author": "L. Aerin",
      "rating": 5,
      "title": "",
      "body": "Glitchy lately. Playbar goes away. Cuts in and out (with good signal) .",
      "version": "9.1.92.3058",
      "date": "2026-10-26T21:55:26.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0,
      "developerReply": "Hi. Thanks for sharing your experience. Have you tried a quick reinstall? If that doesn't help, you can get in touch with our Customer Service by heading to support.spotify.com and searching \"Contact us\"."
    },
    {
      "id": "c2506b8a-7ed0-4993-9653-0d88f0147b9c",
      "author": "Laurene Johansson",
      "rating": 5,
      "title": "",
      "body": "best Music app in my Opinion",
      "version": "9.1.92.3058",
      "date": "2026-10-26T21:54:23.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "e7fbc8de-cd73-4a4a-a5c7-a295ec1cc0c3",
      "author": "Meek Mike",
      "rating": 5,
      "title": "",
      "body": "Spotify is the best for me",
      "version": "9.1.90.2270",
      "date": "2026-10-26T21:47:41.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "62e9d9cf-41b9-4852-a490-1100b3758b82",
      "author": "Surya Putta",
      "rating": 3,
      "title": "",
      "body": "As Spotify’s library has grown, the app on my Pixel has become increasingly slow, laggy, and glitchy. Despite frequent updates, loading times remain frustratingly long, making for a poor user experience.",
      "version": "9.1.92.3058",
      "date": "2026-10-26T21:46:50.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0,
      "developerReply": "Hi there. We appreciate you bringing this to our attention. Have you tried a quick reinstall? If the same issue persists, 
… (truncated, 38097 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"https://play.google.com/store/apps/details?id=com.instagram.android&hl=en","sort":"mosthelpful"}` · 194 ms

App **com.instagram.android** (google) · us · sort=mosthelpful · pages fetched 1/1 · **50 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★ | 434.0.0.44.74 | 2026-09-19 |  | It will not let you see the content you want. I have changed my algorithm 20 times and it absolutely will not show me art. I get cats and ra… |
| ★ | 378.0.0.52.68 | 2025-05-04 |  | if you send someone a link to a post now, it will have your profile attached to it, even if it wasn't your post. they get a popup with whate… |
| ★★ | 388.0.0.34.75 | 2025-07-16 |  | The video calling on this app is hardly worth using. Each time I've used it, the video quality gets super pixilated and grainy anytime the s… |
| ★ | 361.0.0.46.88 | 2024-12-19 |  | Every time I start using Instagram again I remember why I don't. Every single time I'm on reels and scrolling, eventually the videos will on… |
| ★ | 447.0.0.55.81 | 2026-09-18 |  | With the latest update, you can no longer be logged in to more than one account. I've seen no improvements with the last few updates other t… |

_(first 5 of 50 shown)_

<details><summary>Raw response</summary>

```json
{
  "appId": "com.instagram.android",
  "store": "google",
  "country": "us",
  "sort": "mosthelpful",
  "pagesRequested": 1,
  "pagesFetched": 1,
  "count": 50,
  "reviews": [
    {
      "id": "2e644df1-e5ee-49ff-aa0e-8502df3b2099",
      "author": "CD Family",
      "rating": 2,
      "title": "",
      "body": "It will not let you see the content you want. I have changed my algorithm 20 times and it absolutely will not show me art. I get cats and random people and stuff I'm not interested in. it's annoying. Even when you search \"art\" after you scroll once its back to stuff I don't want. I'm over it.",
      "version": "434.0.0.44.74",
      "date": "2026-09-19T02:25:39.000Z",
      "helpfulVotes": 103,
      "totalVotes": 103
    },
    {
      "id": "6616cf3d-e733-4afc-8d45-19fd62888615",
      "author": "Shanna Wallace",
      "rating": 1,
      "title": "",
      "body": "if you send someone a link to a post now, it will have your profile attached to it, even if it wasn't your post. they get a popup with whatever account you were logged in to prompting them to follow it. instagram made this change without any notification. details of your profile should not be attached when you copy / paste a link to a post that wasn't even yours, especially when you have all options to make your account visible to contacts / searchable by email disabled.",
      "version": "378.0.0.52.68",
      "date": "2025-05-04T22:46:55.000Z",
      "helpfulVotes": 12109,
      "totalVotes": 12109
    },
    {
      "id": "6b217418-8595-40e4-bab1-ebdccb12e377",
      "author": "Jasper Ransom",
      "rating": 2,
      "title": "",
      "body": "The video calling on this app is hardly worth using. Each time I've used it, the video quality gets super pixilated and grainy anytime the service isn't exactly *perfect*. The calls also take way too much battery power, quickly heat up the phone, and have overheated the phone before. Having video call functionality is great, but when it's so cumbersome and not worth using, what's the point?",
      "version": "388.0.0.34.75",
      "date": "2025-07-16T17:41:55.000Z",
      "helpfulVotes": 12440,
      "totalVotes": 12440
    },
    {
      "id": "451f3c87-6d30-4399-8c7f-e22e2fd9f458",
      "author": "Madison Walker",
      "rating": 1,
      "title": "",
      "body": "Every time I start using Instagram again I remember why I don't. Every single time I'm on reels and scrolling, eventually the videos will only play halfway and then don't play the rest of the video. It's not a connection issue and I've been dealing with this ever since reels came out. I don't want to watch half a video just for it to cut off.",
      "version": "361.0.0.46.88",
      "date": "2024-12-19T21:56:09.000Z",
      "helpfulVotes": 4347,
      "totalVotes": 4347
    },
    {
      "id": "f7bfc0af-c905-4533-8ce5-94222cc61161",
      "author": "Kyle Nichols",
      "rating": 1,
      "title": "",
      "body": "With the latest update, you can no longer be logged in to more than one account. I've seen no improvements with the last few updates other than the layout, which didn't need fixing, and the logo change. The app used to scroll through my feed smoother too, a thing of the past. It used to work well, but now I might just uninstall it since I have to log in every time anyway. Might as well save the space on my phone for an app that works. Galaxy S5 update: it's now even worse.",
      "version": "447.0.0.55.81",
      "date": "2026-09-18T14:54:57.000Z",
      "helpfulVotes": 261,
      "totalVotes": 261
    },
    {
      "id": "17c46112-c8ce-408e-b961-53d1a095ff63",
      "author": "Warren Abbott",
      "rating": 3,
      "title": "",
      "body": "They push a lot of silly stuff onto you, and the ads are often just slightly off. Like, yes, I'm interested in this, but not in the way the algorithm seems to think. Otherwise, it's nice to share personal photos and animal pics/vids with people I love. Yet, I find myself thinking of
… (truncated, 31036 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"284882215","countries":["us","gb"],"pages":3}` · 611 ms

**Facebook** (284882215, apple) — sample of 300 recent reviews {"us":150,"gb":150}, 2026-10-18 → 2026-10-26

Store rating: **4.53** over 28,928,101 ratings · Sample average: **2.93**

| ★ | count | % |
|---|---|---|
| 5 | 130 | 43.3% |
| 4 | 3 | 1% |
| 3 | 19 | 6.3% |
| 2 | 11 | 3.7% |
| 1 | 137 | 45.7% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 584.1 | 237 | 2.9 | 50.2% |
| 584.0.0 | 63 | 3.03 | 46.0% |

**What changed (basis: version, confidence: medium)** — Version 584.1 (237 reviews) average 2.90★ vs 3.03★ for previous version 584.0.0 (63 reviews), −0.13; negative share 50.2% vs 46% (+4.2 pp). Rising complaints: "election" (new, 12.6% of negative reviews), "democracy" (new, 11.8% of negative reviews), "está" (new, 10.1% of negative reviews).


| rising complaint | status | latest share | previous share | change | example |
|---|---|---|---|---|---|
| election | new | 12.6% | 0.0% | +12.6 pp | Election meddling. Meta has been trying to rig the Brazil election. |
| democracy | new | 11.8% | 0.0% | +11.8 pp | Meta interferes with democracy. This company has been proven to manipulate elections across the world by promoting certain narratives while preventing others from being shared |
| está | new | 10.1% | 0.0% | +10.1 pp | Comportamento Ilegal. Está interferindo no processo eleitoral do meu país e prejudicando a democracia, aumentando a visibilidade de candidatos com discurso de ódio de forma parcial, enviesada e manipu |
| eleitoral | new | 10.1% | 0.0% | +10.1 pp | LIXO. Está interferindo no processo eleitoral do meu país e prejudicando nossa democracia, aumentando a visibilidade de candidatos com discursos de ódio de forma parcial, enviesada e manipuladora. |
| brazilian | new | 10.1% | 0.0% | +10.1 pp | …spread hate, unfairly influencing Brazil’s electoral debate. As a Brazilian, I find this deeply concerning. A company with this much control over what people see owes its users transparency, accountab |
| interfering | new | 10.1% | 0.0% | +10.1 pp | Anti democratic. It is interfering in my country’s electoral process and harming our democracy by increasing the visibility of candidates who use hate speech—in a partial, biased, and manipulative man |
| democracia | new | 8.4% | 0.0% | +8.4 pp | Esta interferindo no processo eleitoral do meu país e prejudicando a democracia. Está interferindo no processo eleitoral do meu país e prejudicando a democracia |
| algorithm | new | 7.6% | 0.0% | +7.6 pp | Meta interfered in Brazil’s elections. Rotten algorithm that suppressed a democratic candidate and promoted a fascist. But Brazilians won this battle. Boycott meta ✊⭐️ |

**Top complaint keywords (1–2★, n=148)**

| phrase | reviews | share | example |
|---|---|---|---|
| ai | 21 | 14.2% | …d I don’t talk to minors nor associate myself with them this meta ai system they have is trash and sooner or later the whole Facebook population will be zero bc of how careless Facebook and meta ai’s |
| ads | 17 | 11.5% | Nuisance ads. Nuisance ads |
| account | 16 | 10.8% | Meta. Worst I’ve lost my Facebook account since 2008 because they say I look younger in my ID. Worst night mate I’ve lost all my pic with my lost ones |
| election | 15 | 10.1% | Election meddling. Meta has been trying to rig the Brazil election. |
| posts | 14 | 9.5% | Sharing posts sucks. You have to tap on 3 different things to share a post to your timeline. It use to be one tap |
| democracy | 14 | 9.5% | Meta interferes with democracy. This company has been proven to manipulate elections across the world by promoting certain narratives while preventing others from being shared |
| brazilian | 12 | 8.1% | …spread hate, unfairly influencing Brazil’s electoral debate. As a Brazilian, I find this deeply concerning. A company with this much control over what people see owes its users transparency, accountab |
| eleitoral | 12 | 8.1% | Comportamento Ilegal. Está interferindo no processo eleitoral do meu país e prejudicando a democracia, aumentando a visibilidade de candidatos com discurso de ódio de forma parcial, enviesada e manipu |
| está | 12 | 8.1% | Comportamento Ilegal. Está interferindo no processo eleitoral do meu país e prejudicando a democracia, aumentando a visibilidade de candidatos com discurso de ódio de forma parcial, enviesada e manipu |
| interfering | 12 | 8.1% | …s with foreign elections for extreme right wing candidates. It is interfering in my country’s electoral process and undermining democracy by trying to force the election of someone who will refuse to |
| stop | 11 | 7.4% | Stop adding things to my Facebook. I am tired of having to go through and ask to remove sites I have not joined. Please STOP! |
| years | 11 | 7.4% | Garbage. Literally the worst thing that’s happened to humanity in the past 25 years. Go play in traffic. |
| company | 11 | 7.4% | …a warning. I am distraught beyond words. I cannot recommend this company to anyone because of their customer support, which is none existent. |
| democracia | 10 | 6.8% | …á interferindo no processo eleitoral do meu país e prejudicando a democracia, aumentando a visibilidade de candidatos com discurso de ódio de forma parcial, enviesada e manipuladora |
| processo eleitoral | 7 | 4.7% | Comportamento Ilegal. Está interferindo no processo eleitoral do meu país e prejudicando a democracia, aumentando a visibilidade de candidatos com discurso de ódio de forma parcial, enviesada e manipu |

**Sample quotes**

> ★ **Meta** — Worst I’ve lost my Facebook account since 2008 because they say I look younger in my ID. Worst night mate I’ve lost all my pic with my lost ones _(v584.0.0, gb, 2026-10-20)_
>
> ★ **Ban acc cmm** — Thề mà cái acc đang dùng ngon tự dưng ban cmn acc là thế nào? Sống hãm l thế, bộ kh biết nhìn lại cái mình làm à? Ở đó mà xét duyệt tài khoản cái dais, gửi cho cũng có mở đ đâu, toàn đ duyệt xong ban cmn acc vĩnh viễn. _(v584.1, us, 2026-10-26)_
>
> ★ **Never Ending Interruption and Irrelevanance** — I just want to catch up with Friends and follow my interests. However, Facebook bombards the user with constant advertising and irrelevant reels etc. you have to be a masochist to get on this app because it punishes you the entire time you use it and even after. _(v584.1, us, 2026-10-26)_
>
> ★★★★★ **Highly recommended** — Have never listen to any therapist who explains symptoms and solutions on such ground level . Highly recommended a true soul person and therapist 💓💓 _(v584.1, us, 2026-10-26)_
>
> ★★★★★ **Opportunity to be a fool or just angry.** — My moment of glory made when where there nothing else to say some fool always say it. _(v584.1, gb, 2026-10-26)_
>
> ★★★★★ **Thank you** — Thank you for allowing the rest of the world to use you guys‘s platform, which helps spray information gang information and keep families connected. Thank you very much. _(v584.1, us, 2026-10-26)_
>

<details><summary>Raw response</summary>

```json
{
  "app": {
    "id": "284882215",
    "name": "Facebook",
    "developer": "Meta Platforms, Inc.",
    "genre": "Social Networking",
    "averageRating": 4.53,
    "ratingCount": 28928101,
    "version": "584.1",
    "currentVersionReleaseDate": "2026-10-23T09:58:23Z",
    "url": "https://apps.apple.com/us/app/facebook/id284882215"
  },
  "store": "apple",
  "sample": {
    "reviews": 300,
    "negativeReviews": 148,
    "positiveReviews": 133,
    "pagesFetched": 6,
    "emptyPages": 0,
    "byCountry": {
      "us": 150,
      "gb": 150
    },
    "dateRange": {
      "from": "2026-10-18T16:06:00-07:00",
      "to": "2026-10-26T06:55:52-07:00"
    },
    "note": "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 137,
      "2": 11,
      "3": 19,
      "4": 3,
      "5": 130
    },
    "percent": {
      "1": 45.7,
      "2": 3.7,
      "3": 6.3,
      "4": 1,
      "5": 43.3
    },
    "average": 2.93,
    "total": 300
  },
  "storeRating": {
    "averageRating": 4.53,
    "ratingCount": 28928101
  },
  "ratingByVersion": [
    {
      "version": "584.1",
      "reviews": 237,
      "averageRating": 2.9,
      "negativeShare": 0.502,
      "firstSeen": "2026-10-23T04:41:40-07:00",
      "lastSeen": "2026-10-26T06:55:52-07:00"
    },
    {
      "version": "584.0.0",
      "reviews": 63,
      "averageRating": 3.03,
      "negativeShare": 0.46,
      "firstSeen": "2026-10-18T16:06:00-07:00",
      "lastSeen": "2026-10-23T01:35:58-07:00"
    }
  ],
  "versionDeltas": {
    "basis": "version",
    "latest": {
      "label": "584.1",
      "versions": [
        "584.1"
      ],
      "reviews": 237,
      "negativeReviews": 119,
      "averageRating": 2.9,
      "negativeShare": 0.502,
      "dateRange": {
        "from": "2026-10-23T04:41:40-07:00",
        "to": "2026-10-26T06:55:52-07:00"
      }
    },
    "previous": {
      "label": "previous version 584.0.0",
      "versions": [
        "584.0.0"
      ],
      "reviews": 63,
      "negativeReviews": 29,
      "averageRating": 3.03,
      "negativeShare": 0.46,
      "dateRange": {
        "from": "2026-10-18T16:06:00-07:00",
        "to": "2026-10-23T01:35:58-07:00"
      }
    },
    "change": {
      "averageRating": -0.13,
      "negativeShare": 0.042
    },
    "whatGotWorse": [
      {
        "phrase": "election",
        "status": "new",
        "latestShare": 0.126,
        "previousShare": 0,
        "change": 0.126,
        "latestReviews": 15,
        "previousReviews": 0,
        "examples": [
          {
            "rating": 1,
            "title": "Election meddling",
            "text": "Election meddling. Meta has been trying to rig the Brazil election.",
            "author": "Kindulas",
            "version": "584.1",
            "date": "2026-10-25T14:26:04-07:00",
            "country": "us"
          },
          {
            "rating": 1,
            "title": "Structural Violence & the Rise of Fascism",
            "text": "…Violence & the Rise of Fascism. Meta as a company is complicit in election interference in Brazil. USA colonialism is alive and well and Meta is a facet of it. Another conglomeration of rich white so-",
            "author": "Like pages",
            "version": "584.1",
            "date": "2026-10-25T13:34:01-07:00",
            "country": "us"
          }
        ]
      },
      {
        "phrase": "democracy",
        "status": "new",
        "latestShare": 0.118,
        "previousShare": 0,
        "change": 0.118,
        "latestReviews": 14,
        "previousReviews": 0,
        "examples": [
          {
            "rating": 1,
            "title": "Meta interferes with democracy",
            "text": "Meta interferes with democracy. This company has been proven to manipulate elections across the world by promoting certain narratives while preventing others from being shared",
            "author": "Ruby K
… (truncated, 15558 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"389801252","countries":["us","gb"],"pages":3}` · 802 ms

**Instagram** (389801252, apple) — sample of 300 recent reviews {"us":150,"gb":150}, 2026-10-24 → 2026-10-26

Store rating: **4.69** over 29,644,344 ratings · Sample average: **1.56**

| ★ | count | % |
|---|---|---|
| 5 | 33 | 11% |
| 4 | 1 | 0.3% |
| 3 | 10 | 3.3% |
| 2 | 12 | 4% |
| 1 | 244 | 81.3% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 453.0 | 8 | 3.13 | 50.0% |
| 452.0.0 | 291 | 1.52 | 86.3% |
| 410.1.0 | 1 | 1 | 100.0% |

**What changed (basis: version, confidence: low)** — Version 453.0 (8 reviews) average 3.13★ vs 1.52★ for previous version 452.0.0 (291 reviews), +1.61; negative share 50% vs 86.3% (−36.3 pp). No complaint phrase rose by 3+ percentage points. Low confidence: few negative reviews in one of the periods.


**Top complaint keywords (1–2★, n=256)**

| phrase | reviews | share | example |
|---|---|---|---|
| elections | 69 | 27.0% | Tried to intervene in my country’s democracy. This app is vicious. Clearly tried to block posts from candidates in my country in the middle of the elections. But we have won in the end. |
| meta | 63 | 24.6% | …OUNT. Instagram used to be a perfect app and every since they had meta ai accounts been getting banned a lot for no reason. I contact them plenty of times and still aint get my accounts back im offici |
| ai | 55 | 21.5% | Ai suggested search is a privacy invasion. The ai suggested search under a reel now shows the location which reduces privacy. There is no way to turn it off and I don’t want everyone knowing my potent |
| interfering | 52 | 20.3% | interfering with elections. they’re interfering with the brazilian elections, they’re suspending american accounts that protest the current government, and they enforce the unethical use of ai onto ev |
| está interferindo | 35 | 13.7% | Anti democracia. o instagram está interferindo nas eleições do Brasil |
| account | 44 | 17.2% | 🫩. It doesn’t let me create an account, when ever I one, they suspend it. Without doing anything wrong |
| brazil | 38 | 14.8% | …layed an inappropriate role in shaping political discourse during Brazil's 2026 presidential election. The company should provide more transparency about how political content is promoted, restricted, |
| country | 32 | 12.5% | Tried to intervene in my country’s democracy. This app is vicious. Clearly tried to block posts from candidates in my country in the middle of the elections. But we have won in the end. |
| democracy | 30 | 11.7% | Tried to intervene in my country’s democracy. This app is vicious. Clearly tried to block posts from candidates in my country in the middle of the elections. But we have won in the end. |
| meu país | 23 | 9.0% | not good. está interferindo no processo eleitoral do meu país e prejudicando a democracia ****** is interfering in my country’s electoral process and harming democracy |
| está interferindo nas | 18 | 7.0% | Anti democracia. o instagram está interferindo nas eleições do Brasil |
| democracia | 28 | 10.9% | Anti democracia. o instagram está interferindo nas eleições do Brasil |
| processo eleitoral | 20 | 7.8% | not good. está interferindo no processo eleitoral do meu país e prejudicando a democracia ****** is interfering in my country’s electoral process and harming democracy |
| content | 25 | 9.8% | …d on friday with little reason besides a link to policy on sexual content. my two posts are a selfie and the ocean. its been 3 days since i same-day appealed it and im still waiting for it to be revie |
| interference | 22 | 8.6% | Shameful election interference. Meta gave ample advantages for a candidate in the Brazilian elections of 2026, their candidate didn’t succeed, now they have a whole country on the fence of using Meta’ |

**Sample quotes**

> ★ **🫩** — It doesn’t let me create an account, when ever I one, they suspend it. Without doing anything wrong _(v452.0.0, us, 2026-10-25)_
>
> ★★ **Duo optimization only** — I hope that what has been put out isn’t the final optimization for instagram on the duo. The bar on the right side of the screen is terrible and when opened in horizontal mode there’s so much wasted space. _(v453.0, us, 2026-10-26)_
>
> ★ **Ai suggested search is a privacy invasion** — The ai suggested search under a reel now shows the location which reduces privacy. There is no way to turn it off and I don’t want everyone knowing my potential location. _(v452.0.0, us, 2026-10-26)_
>
> ★★★★★ **Adding More Profile Pictures** — why did you delete this feature?? it is the best thing ever. please add it back. im begging _(v453.0, us, 2026-10-26)_
>
> ★★★★★ **Thankful , Thank You Guys** — I just think it’s a lifestyle ya know !! & if you treat it right it will in due time adapt & it’s your world whatever you put your mind to it comes to life Instagram been apart of a lot of journeys thanks for the support and memories and love _(v453.0, us, 2026-10-26)_
>
> ★★★★★ **Great website.** — I really enjoy Instagram, connect humanity in a way that we could’ve never dreamed _(v452.0.0, us, 2026-10-25)_
>

<details><summary>Raw response</summary>

```json
{
  "app": {
    "id": "389801252",
    "name": "Instagram",
    "developer": "Instagram, Inc.",
    "genre": "Photo & Video",
    "averageRating": 4.69,
    "ratingCount": 29644344,
    "version": "453.0",
    "currentVersionReleaseDate": "2026-10-26T12:40:24Z",
    "url": "https://apps.apple.com/us/app/instagram/id389801252"
  },
  "store": "apple",
  "sample": {
    "reviews": 300,
    "negativeReviews": 256,
    "positiveReviews": 34,
    "pagesFetched": 6,
    "emptyPages": 0,
    "byCountry": {
      "us": 150,
      "gb": 150
    },
    "dateRange": {
      "from": "2026-10-24T00:34:31-07:00",
      "to": "2026-10-26T06:57:04-07:00"
    },
    "note": "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 244,
      "2": 12,
      "3": 10,
      "4": 1,
      "5": 33
    },
    "percent": {
      "1": 81.3,
      "2": 4,
      "3": 3.3,
      "4": 0.3,
      "5": 11
    },
    "average": 1.56,
    "total": 300
  },
  "storeRating": {
    "averageRating": 4.69,
    "ratingCount": 29644344
  },
  "ratingByVersion": [
    {
      "version": "453.0",
      "reviews": 8,
      "averageRating": 3.13,
      "negativeShare": 0.5,
      "firstSeen": "2026-10-26T05:53:28-07:00",
      "lastSeen": "2026-10-26T06:57:04-07:00"
    },
    {
      "version": "452.0.0",
      "reviews": 291,
      "averageRating": 1.52,
      "negativeShare": 0.863,
      "firstSeen": "2026-10-24T00:34:31-07:00",
      "lastSeen": "2026-10-26T06:26:27-07:00"
    },
    {
      "version": "410.1.0",
      "reviews": 1,
      "averageRating": 1,
      "negativeShare": 1,
      "firstSeen": "2026-10-25T12:04:56-07:00",
      "lastSeen": "2026-10-25T12:04:56-07:00"
    }
  ],
  "versionDeltas": {
    "basis": "version",
    "latest": {
      "label": "453.0",
      "versions": [
        "453.0"
      ],
      "reviews": 8,
      "negativeReviews": 4,
      "averageRating": 3.13,
      "negativeShare": 0.5,
      "dateRange": {
        "from": "2026-10-26T05:53:28-07:00",
        "to": "2026-10-26T06:57:04-07:00"
      }
    },
    "previous": {
      "label": "previous version 452.0.0",
      "versions": [
        "452.0.0"
      ],
      "reviews": 291,
      "negativeReviews": 251,
      "averageRating": 1.52,
      "negativeShare": 0.863,
      "dateRange": {
        "from": "2026-10-24T00:34:31-07:00",
        "to": "2026-10-26T06:26:27-07:00"
      }
    },
    "change": {
      "averageRating": 1.61,
      "negativeShare": -0.363
    },
    "whatGotWorse": [],
    "whatImproved": [
      {
        "phrase": "elections",
        "status": "gone",
        "latestShare": 0,
        "previousShare": 0.275,
        "change": -0.275,
        "latestReviews": 0,
        "previousReviews": 69
      },
      {
        "phrase": "meta",
        "status": "gone",
        "latestShare": 0,
        "previousShare": 0.251,
        "change": -0.251,
        "latestReviews": 0,
        "previousReviews": 63
      },
      {
        "phrase": "ai",
        "status": "gone",
        "latestShare": 0,
        "previousShare": 0.219,
        "change": -0.219,
        "latestReviews": 0,
        "previousReviews": 55
      },
      {
        "phrase": "interfering",
        "status": "gone",
        "latestShare": 0,
        "previousShare": 0.207,
        "change": -0.207,
        "latestReviews": 0,
        "previousReviews": 52
      },
      {
        "phrase": "account",
        "status": "gone",
        "latestShare": 0,
        "previousShare": 0.175,
        "change": -0.175,
        "latestReviews": 0,
        "previousReviews": 44
      }
    ],
    "confidence": "low",
    "summary": "Version 453.0 (8 reviews) average 3.13★ vs 1.52★ for previous version 452.0.0 (291 reviews), +1.61; negative share 50% vs 86.3% (−36.3 pp). No complaint phrase rose by 3+ percentage points. Low confidence: few negative reviews in one of the periods.",
    "notes": []
  },

… (truncated, 6818 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"com.instagram.android","pages":6,"quotes":2}` · 624 ms

**Instagram** (com.instagram.android, google) — sample of 300 recent reviews {"us":300}, 2026-10-13 → 2026-10-14

Store rating: **3.99** over 169,486,506 ratings · Sample average: **3.74**

| ★ | count | % |
|---|---|---|
| 5 | 181 | 60.3% |
| 4 | 23 | 7.7% |
| 3 | 7 | 2.3% |
| 2 | 14 | 4.7% |
| 1 | 75 | 25% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 452.0.0.0.31 | 1 | 4 | 0.0% |
| 451.0.0.53.80 | 43 | 3.05 | 48.8% |
| 451.0.0.41.80 | 1 | 5 | 0.0% |
| 450.0.0.50.77 | 95 | 3.72 | 29.5% |
| 449.0.0.52.84 | 13 | 4.23 | 7.7% |
| 448.0.0.52.84 | 9 | 4.56 | 11.1% |
| 447.0.0.55.81 | 3 | 4.67 | 0.0% |
| 446.0.0.49.77 | 1 | 1 | 100.0% |

**What changed (basis: version, confidence: medium)** — Version 451.0.0.53.80 and newer (44 reviews) average 3.07★ vs 3.73★ for previous versions 450.0.0.50.77–451.0.0.41.80 (96 reviews), −0.66; negative share 47.7% vs 29.2% (+18.5 pp). Rising complaints: "account" (+36.9 pp, 61.9% of negative reviews), "suspended" (+29.8 pp, 33.3% of negative reviews), "wrong" (new, 14.3% of negative reviews).


| rising complaint | status | latest share | previous share | change | example |
|---|---|---|---|---|---|
| account | increased | 61.9% | 25.0% | +36.9 pp | …persistent issue using it on my phone. Every time I create a new account, it gets banned for no apparent reason. Recently, when I tried editing my profile to switch to a business account so I could p |
| suspended | increased | 33.3% | 3.6% | +29.8 pp | …cing major technical issues with Instagram lately. My account was suspended 2 days before, and while I attempted to appeal the decision, I now I'm completely locked out. Even the 'forgotten password' |
| wrong | new | 14.3% | 0.0% | +14.3 pp | …account was suspended without any clear explanation of what I did wrong. My account was restored once, but it was suspended again within just a few hours. I have not violated any Community Standards o |
| reason | increased | 23.8% | 10.7% | +13.1 pp | For some reason, drains 40%+ of my battery with 1hr 14m of usage on a new Pixel 10 Pro. Absurd. |
| support | increased | 14.3% | 3.6% | +10.7 pp | horrible customer support i try to go get my old account back cause I got locked out of my account cause I don't have access to my authenticator app so I go to support and it's freaking Ai trying to h |
| request | increased | 14.3% | 3.6% | +10.7 pp | …he instragram guide line but instragram suspended my accountso my request is if your ai or team is not working properly then please supervise it thanks !! 😤 |
| major technical issue | new | 9.5% | 0.0% | +9.5 pp | i am having a major technical issue from Instagram. you have been suspending my accounts without any reason. i simply just talk share reels with my friends and the next day i find out my id is suspend |
| kar diya gaya | new | 9.5% | 0.0% | +9.5 pp | meri dushri id band kar diya gaya hai jo mey 6 sal purana id thA |

**Top complaint keywords (1–2★, n=89)**

| phrase | reviews | share | example |
|---|---|---|---|
| account | 28 | 31.5% | Instagram epitomizes the dead internet theory - I made a new account and yet everything I see on the feed/reels is rehashed content I've already seen numerous times originally posted months ago. The a |
| reason | 14 | 15.7% | …Every time I create a new account, it gets banned for no apparent reason. Recently, when I tried editing my profile to switch to a business account so I could promote my business online, the account w |
| suspended | 13 | 14.6% | …t so I could promote my business online, the account was suddenly suspended just for making edits. This has happened multiple times now, and I really hope the developers can look into this and fix it. |
| banned | 7 | 7.9% | …using it on my phone. Every time I create a new account, it gets banned for no apparent reason. Recently, when I tried editing my profile to switch to a business account so I could promote my busines |
| community guidelines | 5 | 5.6% | …pologize for any mistake and I am willing to follow all Instagram Community Guidelines and Terms of Use going forward. This account is important to me, and I kindly request you to review my account an |
| reels | 6 | 6.7% | …heory - I made a new account and yet everything I see on the feed/reels is rehashed content I've already seen numerous times originally posted months ago. The algorithm is ridiculously lazy too. It's |
| request | 6 | 6.7% | …,887 My Instagram account has been suspended, and I would like to request a manual review of my account. I understand that I may have violated one or more of Instagram's rules unintentionally. I since |
| disabled | 6 | 6.7% | …tting a video selfie for verification, my account was permanently disabled, and I was told I could not request another review. |
| email | 5 | 5.6% | …r did anything wrong. and if u can make up hers my id mayank29_13 email-mayank2937383 |
| support | 5 | 5.6% | Hello Instagram Support, 4,887 My Instagram account has been suspended, and I would like to request a manual review of my account. I understand that I may have violated one or more of Instagram's rule |
| kar | 5 | 5.6% | bina matlab ke id suspend kar raha |
| violated | 5 | 5.6% | …quest a manual review of my account. I understand that I may have violated one or more of Instagram's rules unintentionally. I sincerely apologize for any mistake and I am willing to follow all Instag |
| wrong | 5 | 5.6% | …it then ig i should stop using Instagram cuz I never did anything wrong. and if u can make up hers my id mayank29_13 email-mayank2937383 |
| hai | 4 | 4.5% | Instagram bahot hi badhiya aap hai mera fevret aap hai Instagram bahot badhiya 🙋😘😘 |
| suspend | 4 | 4.5% | bina matlab ke id suspend kar raha |

**Sample quotes**

> ★ Instagram epitomizes the dead internet theory - I made a new account and yet everything I see on the feed/reels is rehashed content I've already seen numerous times originally posted months ago. The algorithm is ridiculously lazy too. It's not refreshing, it's far from "SOCIAL… _(v450.0.0.50.77, us, 2026-10-14)_
>
> ★ BRING BACK SQUARE GRIDS. 2x speed thing or make it so sliding back up undoes it because I always slide down to get my thumb out the way of the reel. IG should store a list of pinned messages the way it does with links or media. I can't read the reels if I can't hold down to… _(v450.0.0.50.77, us, 2026-10-13)_
>
> ★★★★★ my insta id delete kiya to voh vapis do jald My Instagram account has been suspended, and I would like to request a manual review of my account. I understand that I may have violated one or more of Instagram’s rules unintentionally. I sincerely apologize for any mistake and I… _(v450.0.0.50.77, us, 2026-10-14)_
>
> ★★★★★ Dear Instagram Team, my account (mr.x.harshit008) has been deactivated. I believe this is a mistake as I have always followed all community guidelines and terms of service. I request you to please review my account and reactivate it as soon as possible. Thank you for your time… _(v?, us, 2026-10-14)_
>

<details><summary>Raw response</summary>

```json
{
  "app": {
    "id": "com.instagram.android",
    "name": "Instagram",
    "developer": "Instagram",
    "genre": "Social",
    "averageRating": 3.99,
    "ratingCount": 169486506,
    "version": null,
    "currentVersionReleaseDate": "2026-10-26T16:50:51.000Z",
    "installs": "5,000,000,000+",
    "url": "https://play.google.com/store/apps/details?id=com.instagram.android"
  },
  "store": "google",
  "sample": {
    "reviews": 300,
    "negativeReviews": 89,
    "positiveReviews": 204,
    "pagesFetched": 6,
    "byCountry": {
      "us": 300
    },
    "dateRange": {
      "from": "2026-10-13T18:40:27.000Z",
      "to": "2026-10-14T01:24:05.000Z"
    },
    "note": "Sample = most recent written reviews from Google Play in the requested language; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 75,
      "2": 14,
      "3": 7,
      "4": 23,
      "5": 181
    },
    "percent": {
      "1": 25,
      "2": 4.7,
      "3": 2.3,
      "4": 7.7,
      "5": 60.3
    },
    "average": 3.74,
    "total": 300
  },
  "storeRating": {
    "averageRating": 3.99,
    "ratingCount": 169486506
  },
  "ratingByVersion": [
    {
      "version": "452.0.0.0.31",
      "reviews": 1,
      "averageRating": 4,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T22:12:23.000Z",
      "lastSeen": "2026-10-13T22:12:23.000Z"
    },
    {
      "version": "451.0.0.53.80",
      "reviews": 43,
      "averageRating": 3.05,
      "negativeShare": 0.488,
      "firstSeen": "2026-10-13T18:42:49.000Z",
      "lastSeen": "2026-10-14T01:18:42.000Z"
    },
    {
      "version": "451.0.0.41.80",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T20:47:00.000Z",
      "lastSeen": "2026-10-13T20:47:00.000Z"
    },
    {
      "version": "450.0.0.50.77",
      "reviews": 95,
      "averageRating": 3.72,
      "negativeShare": 0.295,
      "firstSeen": "2026-10-13T18:40:27.000Z",
      "lastSeen": "2026-10-14T01:24:05.000Z"
    },
    {
      "version": "449.0.0.52.84",
      "reviews": 13,
      "averageRating": 4.23,
      "negativeShare": 0.077,
      "firstSeen": "2026-10-13T18:57:44.000Z",
      "lastSeen": "2026-10-14T01:23:42.000Z"
    },
    {
      "version": "448.0.0.52.84",
      "reviews": 9,
      "averageRating": 4.56,
      "negativeShare": 0.111,
      "firstSeen": "2026-10-13T18:41:44.000Z",
      "lastSeen": "2026-10-14T01:15:00.000Z"
    },
    {
      "version": "447.0.0.55.81",
      "reviews": 3,
      "averageRating": 4.67,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T19:26:59.000Z",
      "lastSeen": "2026-10-13T23:23:03.000Z"
    },
    {
      "version": "446.0.0.49.77",
      "reviews": 1,
      "averageRating": 1,
      "negativeShare": 1,
      "firstSeen": "2026-10-13T23:57:52.000Z",
      "lastSeen": "2026-10-13T23:57:52.000Z"
    },
    {
      "version": "445.0.0.45.83",
      "reviews": 3,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T18:54:18.000Z",
      "lastSeen": "2026-10-14T00:17:43.000Z"
    },
    {
      "version": "444.0.0.46.85",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T23:36:09.000Z",
      "lastSeen": "2026-10-13T23:36:09.000Z"
    },
    {
      "version": "443.0.0.48.82",
      "reviews": 1,
      "averageRating": 4,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T18:57:30.000Z",
      "lastSeen": "2026-10-13T18:57:30.000Z"
    },
    {
      "version": "442.0.0.46.79",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T19:57:27.000Z",
      "lastSeen": "2026-10-13T19:57:27.000Z"
    },
    {
      "version": "441.0.0.43.81",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-13T23:29:08.000Z",
      "lastSeen": "2026-10-13T23:29:08.000Z"
    },
    {
      "version": "440.1.0.46.86",
 
… (truncated, 19009 more chars — see transcript.json)
```

</details>

### `compare_apps` 

Arguments: `{"app_ids":["284882215","389801252"],"country":"us","pages":2}` · 45 ms

| metric | 284882215 (apple) | 389801252 (apple) |
|---|---|---|
| name | Facebook | Instagram |
| developer | Meta Platforms, Inc. | Instagram, Inc. |
| store rating | 4.53 | 4.69 |
| store rating count | 28,928,101 | 29,644,344 |
| installs | – | – |
| current version | 584.1 | 453.0 |
| released | 2026-10-23 | 2026-10-26 |
| size (MB) | 504.8 | 640.6 |
| recent sample | 100 | 100 |
| recent avg | 3.12 | 2.1 |
| % negative (1–2★) | 45.0% | 71.0% |
| % positive (4–5★) | 49.0% | 24.0% |
| latest version avg | 3.12 (584.1, n=100) | 2.86 (453.0, n=7) |
| top complaints | ads, ai, post, account, help | ai, account, meta, opt, policy |

**Leaders:** storeAverageRating: Instagram (4.69) · storeRatingCount: Instagram (29644344) · recentAverageRating: Facebook (3.12) · lowestRecentNegativeShare: Facebook (0.45) · latestVersionAverageRating: Facebook (3.12)

<details><summary>Raw response</summary>

```json
{
  "country": "us",
  "apps": [
    {
      "id": "284882215",
      "store": "apple",
      "found": true,
      "name": "Facebook",
      "developer": "Meta Platforms, Inc.",
      "genre": "Social Networking",
      "price": "Free",
      "storeAverageRating": 4.53,
      "storeRatingCount": 28928101,
      "currentVersion": "584.1",
      "currentVersionReleaseDate": "2026-10-23T09:58:23Z",
      "sizeMB": 504.8,
      "recentReviewSample": 100,
      "recentAverageRating": 3.12,
      "recentNegativeShare": 0.45,
      "recentPositiveShare": 0.49,
      "latestVersion": "584.1",
      "latestVersionAverageRating": 3.12,
      "latestVersionReviewCount": 100,
      "ratingDistribution": {
        "1": 40,
        "2": 5,
        "3": 6,
        "4": 1,
        "5": 48
      },
      "reviewDateRange": {
        "from": "2026-10-25T13:06:34-07:00",
        "to": "2026-10-26T06:55:52-07:00"
      },
      "topComplaints": [
        {
          "phrase": "ads",
          "reviews": 9,
          "share": 0.2
        },
        {
          "phrase": "ai",
          "reviews": 5,
          "share": 0.111
        },
        {
          "phrase": "post",
          "reviews": 4,
          "share": 0.089
        },
        {
          "phrase": "account",
          "reviews": 4,
          "share": 0.089
        },
        {
          "phrase": "help",
          "reviews": 4,
          "share": 0.089
        }
      ]
    },
    {
      "id": "389801252",
      "store": "apple",
      "found": true,
      "name": "Instagram",
      "developer": "Instagram, Inc.",
      "genre": "Photo & Video",
      "price": "Free",
      "storeAverageRating": 4.69,
      "storeRatingCount": 29644344,
      "currentVersion": "453.0",
      "currentVersionReleaseDate": "2026-10-26T12:40:24Z",
      "sizeMB": 640.6,
      "recentReviewSample": 100,
      "recentAverageRating": 2.1,
      "recentNegativeShare": 0.71,
      "recentPositiveShare": 0.24,
      "latestVersion": "453.0",
      "latestVersionAverageRating": 2.86,
      "latestVersionReviewCount": 7,
      "ratingDistribution": {
        "1": 66,
        "2": 5,
        "3": 5,
        "4": 1,
        "5": 23
      },
      "reviewDateRange": {
        "from": "2026-10-25T13:57:29-07:00",
        "to": "2026-10-26T06:57:04-07:00"
      },
      "topComplaints": [
        {
          "phrase": "ai",
          "reviews": 28,
          "share": 0.394
        },
        {
          "phrase": "account",
          "reviews": 18,
          "share": 0.254
        },
        {
          "phrase": "meta",
          "reviews": 17,
          "share": 0.239
        },
        {
          "phrase": "opt",
          "reviews": 9,
          "share": 0.127
        },
        {
          "phrase": "policy",
          "reviews": 7,
          "share": 0.099
        }
      ]
    }
  ],
  "leaders": {
    "storeAverageRating": {
      "id": "389801252",
      "store": "apple",
      "name": "Instagram",
      "value": 4.69
    },
    "storeRatingCount": {
      "id": "389801252",
      "store": "apple",
      "name": "Instagram",
      "value": 29644344
    },
    "recentAverageRating": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 3.12
    },
    "lowestRecentNegativeShare": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 0.45
    },
    "latestVersionAverageRating": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 3.12
    }
  }
}
```

</details>

### `compare_apps` 

Arguments: `{"app_ids":["324684580","com.spotify.music"],"pages":1}` · 261 ms

| metric | 324684580 (apple) | com.spotify.music (google) |
|---|---|---|
| name | Spotify: Music and Podcasts | Spotify: Music and Podcasts |
| developer | Spotify | Spotify AB |
| store rating | 4.77 | 4.35 |
| store rating count | 42,785,266 | 36,550,214 |
| installs | – | 1,000,000,000+ |
| current version | 9.1.94 | – |
| released | 2026-10-23 | 2026-10-23 |
| size (MB) | 310.1 | – |
| recent sample | 50 | 50 |
| recent avg | 3.96 | 3.68 |
| % negative (1–2★) | 24.0% | 30.0% |
| % positive (4–5★) | 70.0% | 66.0% |
| latest version avg | 3.96 (9.1.94, n=50) | 3.5 (9.1.94.1923, n=2) |
| top complaints | song, ads, switch, listen, plays | ads, songs, play, premium |

**Leaders:** storeAverageRating: Spotify: Music and Podcasts (4.77) · storeRatingCount: Spotify: Music and Podcasts (42785266) · recentAverageRating: Spotify: Music and Podcasts (3.96) · lowestRecentNegativeShare: Spotify: Music and Podcasts (0.24) · latestVersionAverageRating: Spotify: Music and Podcasts (3.96)

<details><summary>Raw response</summary>

```json
{
  "country": "us",
  "apps": [
    {
      "id": "324684580",
      "store": "apple",
      "found": true,
      "name": "Spotify: Music and Podcasts",
      "developer": "Spotify",
      "genre": "Music",
      "price": "Free",
      "storeAverageRating": 4.77,
      "storeRatingCount": 42785266,
      "currentVersion": "9.1.94",
      "currentVersionReleaseDate": "2026-10-23T17:59:53Z",
      "sizeMB": 310.1,
      "recentReviewSample": 50,
      "recentAverageRating": 3.96,
      "recentNegativeShare": 0.24,
      "recentPositiveShare": 0.7,
      "latestVersion": "9.1.94",
      "latestVersionAverageRating": 3.96,
      "latestVersionReviewCount": 50,
      "ratingDistribution": {
        "1": 7,
        "2": 5,
        "3": 3,
        "4": 3,
        "5": 32
      },
      "reviewDateRange": {
        "from": "2026-10-26T03:19:00-07:00",
        "to": "2026-10-26T06:55:06-07:00"
      },
      "topComplaints": [
        {
          "phrase": "song",
          "reviews": 7,
          "share": 0.583
        },
        {
          "phrase": "ads",
          "reviews": 5,
          "share": 0.417
        },
        {
          "phrase": "switch",
          "reviews": 3,
          "share": 0.25
        },
        {
          "phrase": "listen",
          "reviews": 2,
          "share": 0.167
        },
        {
          "phrase": "plays",
          "reviews": 2,
          "share": 0.167
        }
      ]
    },
    {
      "id": "com.spotify.music",
      "store": "google",
      "found": true,
      "name": "Spotify: Music and Podcasts",
      "developer": "Spotify AB",
      "genre": "Music & Audio",
      "price": "Free",
      "storeAverageRating": 4.35,
      "storeRatingCount": 36550214,
      "installs": "1,000,000,000+",
      "currentVersion": null,
      "currentVersionReleaseDate": "2026-10-23T12:37:22.000Z",
      "sizeMB": null,
      "recentReviewSample": 50,
      "recentAverageRating": 3.68,
      "recentNegativeShare": 0.3,
      "recentPositiveShare": 0.66,
      "latestVersion": "9.1.94.1923",
      "latestVersionAverageRating": 3.5,
      "latestVersionReviewCount": 2,
      "ratingDistribution": {
        "1": 13,
        "2": 2,
        "3": 2,
        "4": 4,
        "5": 29
      },
      "reviewDateRange": {
        "from": "2026-10-26T19:35:35.000Z",
        "to": "2026-10-26T22:10:35.000Z"
      },
      "topComplaints": [
        {
          "phrase": "ads",
          "reviews": 5,
          "share": 0.333
        },
        {
          "phrase": "songs",
          "reviews": 5,
          "share": 0.333
        },
        {
          "phrase": "play",
          "reviews": 3,
          "share": 0.2
        },
        {
          "phrase": "premium",
          "reviews": 2,
          "share": 0.133
        }
      ]
    }
  ],
  "leaders": {
    "storeAverageRating": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 4.77
    },
    "storeRatingCount": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 42785266
    },
    "recentAverageRating": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 3.96
    },
    "lowestRecentNegativeShare": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 0.24
    },
    "latestVersionAverageRating": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 3.96
    }
  }
}
```

</details>

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"not-an-id"}` · 2 ms

> Error (invalid_input): Invalid app_id "not-an-id". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"284882215","pages":11}` · 2 ms

> MCP error -32602: Input validation error: Invalid arguments for tool get_app_reviews: Too big: expected number to be <=10 at pages

### `search_apps` ⚠️ (error)

Arguments: `{"term":"x","country":"usa"}` · 1 ms

> MCP error -32602: Input validation error: Invalid arguments for tool search_apps: must be a 2-letter ISO country code at country

### `compare_apps` ⚠️ (error)

Arguments: `{"app_ids":["284882215"]}` · 1 ms

> MCP error -32602: Input validation error: Invalid arguments for tool compare_apps: Too small: expected array to have >=2 items at app_ids

### `get_app_reviews` 

Arguments: `{"app_id":"999999999999"}` · 316 ms

App **999999999999** (apple) · us · sort=mostrecent · pages fetched 0/1 · **0 reviews**

_Apple's public review feed returned empty pages for this app, so the sample is partial (fewer reviews than requested). Otherwise the app may not exist in this storefront._


<details><summary>Raw response</summary>

```json
{
  "appId": "999999999999",
  "store": "apple",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 1,
  "pagesFetched": 0,
  "count": 0,
  "emptyPages": 10,
  "note": "Apple's public review feed returned empty pages for this app, so the sample is partial (fewer reviews than requested). Otherwise the app may not exist in this storefront.",
  "reviews": []
}
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"com.example.does.not.exist.zz"}` · 71 ms

App **com.example.does.not.exist.zz** (google) · us · sort=mostrecent · pages fetched 0/1 · **0 reviews**

_No reviews returned. The app may not exist in this storefront or has no written reviews. If this is an Apple bundle id, use the numeric App Store id instead._


<details><summary>Raw response</summary>

```json
{
  "appId": "com.example.does.not.exist.zz",
  "store": "google",
  "country": "us",
  "sort": "mostrecent",
  "pagesRequested": 1,
  "pagesFetched": 0,
  "count": 0,
  "note": "No reviews returned. The app may not exist in this storefront or has no written reviews. If this is an Apple bundle id, use the numeric App Store id instead.",
  "reviews": []
}
```

</details>

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"com.spotify.music","store":"apple"}` · 1 ms

> Error (invalid_input): "com.spotify.music" looks like a Google Play package name; use store "google" (or omit store).

### `review_insights` ⚠️ (error)

Arguments: `{"app_id":"284882215","store":"google"}` · 0 ms

> Error (invalid_input): Invalid Google Play app id "284882215". Use the package name (e.g. com.instagram.android) or a play.google.com/store/apps/details?id=… URL.

## Streamable HTTP mode

```json
{
  "url": "http://127.0.0.1:44261/mcp",
  "health": {
    "status": "ok",
    "name": "app-review-intel-mcp",
    "version": "1.1.3",
    "endpoint": "/mcp"
  },
  "tools": [
    "search_apps",
    "get_app_reviews",
    "review_insights",
    "compare_apps"
  ],
  "sampleCall": {
    "tool": "search_apps",
    "isError": false,
    "firstApp": "Instagram"
  }
}
```

## Assertions

- ✅ unit: curly apostrophes normalized
- ✅ unit: plural stemming
- ✅ unit: filler words filtered
- ✅ unit: plural/singular merged (account/accounts) — full screen, account, reels
- ✅ unit: bigram suppresses redundant unigram (full screen ⊃ screen) — full screen, account, reels
- ✅ unit: keywords carry share
- ✅ unit: app name tokens excluded
- ✅ unit: versionDeltas compares latest vs previous version — "2.0.0"
- ✅ unit: versionDeltas rating & negative-share change — {"averageRating":-2.5,"negativeShare":0.5}
- ✅ unit: whatGotWorse finds new complaint with quote — ["login loop","stuck"]
- ✅ unit: summary mentions change — Version 2.0.0 (12 reviews) average 1.50★ vs 4.00★ for previous version 1.9.0 (12 reviews), −2.50; negative share 83.3% vs 33.3% (+50 pp). Rising complaints: "login loop" (new, 80% of negative reviews), "stuck" (new, 80% of negative reviews). Low confidence: few negative reviews in one of the periods.
- ✅ unit: single version → time fallback — ["Only one app version (5.0) is present in the sample, so a version-to-version comparison is not possible.","Fell back to comparing the last 3 days against earlier reviews in the sample. To reach earlier versions, raise `pages` (up to 10), add more `countries`, or pass `since_version` to choose the split point."]
- ✅ unit: single version, short span → explains how to get more data
- ✅ unit: since_version split
- ✅ play disabled: instructions don't mention Google Play — App review intelligence for the Apple App Store (no API keys). Typical flow: search_apps to get an app id → review_insights for a one-call summary (ratings, complaints, what got worse in the latest version) → get_app_reviews only when you need raw review text → compare_apps for competitor benchmarks. App ids are numeric (284882215). Review data is a recent sample (≤500 reviews per country per call), not the full rating population.
- ✅ play disabled: still lists 4 tools
- ✅ play disabled: no tool title/description/schema advertises Google Play
- ✅ play disabled: no lang param
- ✅ play disabled: store param absent or apple-only — search_apps:["apple"] get_app_reviews:["apple"] review_insights:["apple"] compare_apps:null
- ✅ play disabled: search_apps store=google → coming-soon error — MCP error -32602: Input validation error: Invalid arguments for tool search_apps: Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today. at store
- ✅ play disabled: get_app_reviews package name → coming-soon error — Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.
- ✅ play disabled: get_app_reviews Play URL → coming-soon error — Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.
- ✅ play disabled: review_insights package name → coming-soon error — Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.
- ✅ play disabled: review_insights store=google → coming-soon error — MCP error -32602: Input validation error: Invalid arguments for tool review_insights: Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today. at store
- ✅ play disabled: compare_apps mixed Apple + Google → coming-soon error — Error (invalid_input): Google Play support is coming soon on the hosted version; use the open-source local server (https://github.com/gunnargray-dev/app-store-review-intelligence-mcp) for Google Play today.
- ✅ play disabled: invalid Apple id error stays Apple-only — Error (invalid_input): Invalid app_id "not-an-id". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.
- ✅ lists 4 tools — compare_apps,get_app_reviews,review_insights,search_apps
- ✅ every tool has an input schema & description
- ✅ server version 1.1.3
- ✅ descriptions stay concise (< 700 chars) — 416,412,685,593
- ✅ every param has a description
- ✅ app tools accept store + lang
- ✅ review_insights accepts optional since_version
- ✅ search_apps ok
- ✅ search_apps returns results — count=5
- ✅ search_apps finds Instagram (389801252)
- ✅ search_apps defaults country=us
- ✅ search_apps finds Facebook (284882215)
- ✅ search_apps defaults store=apple
- ✅ search_apps google ok
- ✅ search_apps google finds com.instagram.android — com.instagram.android,com.instagram.airwave,com.instagram.barcelona,com.instagram.moonshot,com.snapchat.android
- ✅ search_apps google returns ratings & installs
- ✅ search_apps google respects limit
- ✅ search_apps google keyword search returns list results — count=8
- ✅ get_app_reviews Facebook ok
- ✅ get_app_reviews Facebook returns reviews — count=100
- ✅ get_app_reviews Facebook normalized shape
- ✅ get_app_reviews Facebook no duplicate ids
- ✅ get_app_reviews Instagram ok
- ✅ get_app_reviews Instagram returns reviews — count=100
- ✅ get_app_reviews Instagram normalized shape
- ✅ get_app_reviews Instagram no duplicate ids
- ✅ get_app_reviews accepts App Store URL + mosthelpful
- ✅ get_app_reviews google ok (store inferred)
- ✅ get_app_reviews google returns ~100 reviews — count=100
- ✅ get_app_reviews google normalized shape
- ✅ get_app_reviews google no duplicate ids
- ✅ get_app_reviews google newest first
- ✅ get_app_reviews accepts Play URL + mosthelpful
- ✅ review_insights Facebook ok
- ✅ review_insights Facebook distribution sums to sample
- ✅ review_insights Facebook covers both countries — {"us":150,"gb":150}
- ✅ review_insights Facebook has version breakdown
- ✅ review_insights Facebook has complaint keywords
- ✅ review_insights Facebook keywords exclude stopwords/filler — ai, ads, account, election, posts, democracy, brazilian, eleitoral, está, interfering, stop, years, company, democracia, processo eleitoral
- ✅ review_insights Facebook keywords exclude app name
- ✅ review_insights Facebook has sample quotes
- ✅ review_insights Facebook has versionDeltas — Version 584.1 (237 reviews) average 2.90★ vs 3.03★ for previous version 584.0.0 (63 reviews), −0.13; negative share 50.2% vs 46% (+4.2 pp). Rising complaints: "election" (new, 12.6% of negative reviews), "democracy" (new, 11.8% of negative reviews), "está" (new, 10.1% of negative reviews).
- ✅ review_insights Facebook versionDeltas explains or compares
- ✅ review_insights Instagram ok
- ✅ review_insights Instagram distribution sums to sample
- ✅ review_insights Instagram covers both countries — {"us":150,"gb":150}
- ✅ review_insights Instagram has version breakdown
- ✅ review_insights Instagram has complaint keywords
- ✅ review_insights Instagram keywords exclude stopwords/filler — elections, meta, ai, interfering, está interferindo, account, brazil, country, democracy, meu país, está interferindo nas, democracia, processo eleitoral, content, interference
- ✅ review_insights Instagram keywords exclude app name
- ✅ review_insights Instagram has sample quotes
- ✅ review_insights Instagram has versionDeltas — Version 453.0 (8 reviews) average 3.13★ vs 1.52★ for previous version 452.0.0 (291 reviews), +1.61; negative share 50% vs 86.3% (−36.3 pp). No complaint phrase rose by 3+ percentage points. Low confidence: few negative reviews in one of the periods.
- ✅ review_insights Instagram versionDeltas explains or compares
- ✅ review_insights google ok
- ✅ review_insights google has app metadata
- ✅ review_insights google sample size — n=300
- ✅ review_insights google complaint keywords — account, reason, suspended, banned, community guidelines, reels, request, disabled, email, support, kar, violated, wrong, hai, suspend
- ✅ review_insights google versionDeltas by version — Version 451.0.0.53.80 and newer (44 reviews) average 3.07★ vs 3.73★ for previous versions 450.0.0.50.77–451.0.0.41.80 (96 reviews), −0.66; negative share 47.7% vs 29.2% (+18.5 pp). Rising complaints: "account" (+36.9 pp, 61.9% of negative reviews), "suspended" (+29.8 pp, 33.3% of negative reviews), "wrong" (new, 14.3% of negative reviews).
- ✅ review_insights google whatGotWorse entries are well-formed
- ✅ compare_apps ok
- ✅ compare_apps returns both apps
- ✅ compare_apps has metrics
- ✅ compare_apps names leaders
- ✅ compare_apps mixes Apple + Google
- ✅ compare_apps google row has installs + latest version
- ✅ compare_apps leaders carry store
- ✅ invalid app_id → isError
- ✅ pages > 10 rejected by schema
- ✅ invalid country rejected
- ✅ compare_apps with 1 id rejected
- ✅ unknown app → graceful empty result
- ✅ unknown Play app → graceful empty result
- ✅ package name with store=apple → helpful error
- ✅ numeric id with store=google → error
- ✅ HTTP mode: health endpoint
- ✅ HTTP mode: lists 4 tools
- ✅ HTTP mode: tool call works
