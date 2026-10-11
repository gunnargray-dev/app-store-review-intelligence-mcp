# app-review-intel-mcp — smoke test transcript

Generated 2026-10-11T22:31:01.489Z by `test/smoke.mjs` against live Apple and Google Play endpoints. Server: **app-review-intel-mcp 1.1.0** over stdio.

**Assertions: 103/103 passed.**

## Tools

- **`search_apps`** — Find apps by name or keyword and get the app id the other tools need. Returns id (Apple numeric id or Google Play package name), name, developer, rating, rating count, price, genre, current version, store URL (Google adds installs). Use when the user names an app ("Duolingo", "Calm") or a category ("budget apps"). Set store: "google" for Android/Google Play. Cheap, one call. Next: review_insights or compare_apps.
  - params: `term`* (string), `store` (string), `lang` (string), `country` (string), `limit` (integer)
- **`get_app_reviews`** — Fetch raw reviews for one app: rating, title (Apple only), text, app version, date, helpful votes (Google adds developer replies). Use when the user wants to read or quote actual reviews or you need text for custom analysis. For summaries, complaints or "what broke", call review_insights instead: it is one flat-priced call. Billed per review returned (~50 per page; default 1 page). Max 10 pages ≈ 500 reviews.
  - params: `app_id`* (integer|string), `store` (string), `lang` (string), `country` (string), `pages` (integer), `sort` (string)
- **`review_insights`** — Best first call for any question about an app's user feedback. Analyses recent reviews and returns: rating distribution, average rating per app version, top complaint phrases from 1-2★ reviews (share + example quote), versionDeltas (latest version vs earlier: rating change, negative-share change, rising complaints with quotes; falls back to last 3 days vs earlier), and sample quotes. Use for "why are users unhappy with X", "what broke in the last update", "top complaints about X", "summarize feedback". One flat price per call regardless of pages/countries. Apple and Google Play.
  - params: `app_id`* (integer|string), `store` (string), `lang` (string), `countries` (array), `pages` (integer), `since_version` (string), `keyword_limit` (integer), `quotes` (integer)
- **`compare_apps`** — Benchmark 2-10 apps in one storefront for competitor analysis: store rating, rating count, price, current version & release date (Google adds installs), plus recent-review metrics (sample average, % negative / positive, latest-version average, top 5 complaints) and per-metric leaders. Apple ids and Google Play package names can be mixed (e.g. iOS vs Android of the same app). Examples: "Notion vs Evernote", "which meditation app has the happiest users". One flat price per call. Get ids from search_apps first.
  - params: `app_ids`* (array), `country` (string), `lang` (string), `pages` (integer)

## Calls

### `search_apps` ⚠️ (error)

Arguments: `{"term":"instagram","store":"google"}` · 6 ms

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

Arguments: `{"app_id":"not-an-id"}` · 2 ms

> Error (invalid_input): Invalid app_id "not-an-id". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.

### `search_apps` 

Arguments: `{"term":"instagram","country":"us","limit":5}` · 113 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,583,259 | 450.1.0 |
| 835599320 | TikTok - Videos, Shop & LIVE | TIKTOK PTE. LTD. | 4.72 | 18,388,560 | 47.1.0 |
| 447188370 | Snapchat | Snap, Inc. | 4.51 | 5,959,258 | 14.27.0.54 |
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,709,088 | 582.0.0 |
| 544007664 | YouTube | Google LLC | 4.67 | 49,370,129 | 21.41.5 |

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
      "ratingCount": 29583259,
      "currentVersionAverageRating": 4.69,
      "currentVersionRatingCount": 29583259,
      "version": "450.1.0",
      "currentVersionReleaseDate": "2026-10-06T12:29:07Z",
      "releaseDate": "2010-10-06T08:12:41Z",
      "contentRating": "12+",
      "sizeBytes": 623194112,
      "minimumOsVersion": "16.3",
      "url": "https://apps.apple.com/us/app/instagram/id389801252",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/30/17/93/30179310-7a32-f8b3-5b31-a01addf6c367/Prod-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
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
      "ratingCount": 18388560,
      "currentVersionAverageRating": 4.72,
      "currentVersionRatingCount": 18388560,
      "version": "47.1.0",
      "currentVersionReleaseDate": "2026-10-07T18:18:07Z",
      "releaseDate": "2014-04-02T22:44:45Z",
      "contentRating": "12+",
      "sizeBytes": 1054171136,
      "minimumOsVersion": "14.0",
      "url": "https://apps.apple.com/us/app/tiktok-videos-shop-live/id835599320",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/d8/f0/b2/d8f0b203-3968-dd77-07ff-70134b89f7c1/TikTok_AppIcon26-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
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
      "ratingCount": 5959258,
      "currentVersionAverageRating": 4.51,
      "currentVersionRatingCount": 5959258,
      "version": "14.27.0.54",
      "currentVersionReleaseDate": "2026-10-07T11:10:27Z",
      "releaseDate": "2011-07-13T23:51:40Z",
      "contentRating": "12+",
      "sizeBytes": 423038976,
      "minimumOsVersion": "15.0",
      "url": "https://apps.apple.com/us/app/snapchat/id447188370",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/cc/aa/03/ccaa03e2-6d86-915d-bdd9-1b052354a544/AppIcon-0-0-1x_U007epad-0-1-0-85-220.png/512x512bb.jpg",
      "description": "Snapchat is a fast and fun way to share the moment with your friends and family SNAP • Snapchat opens right to the Camera — just tap to take a photo, or press and hold for video. • Express yourself with Lenses, Filters, Bitmoji and more! • Try out new Lenses daily created by the Snapchat…"
    },
    {
      "id": "284882215",
      "name": "Facebook",
      "developer": "Meta Platforms, Inc.",
      "developerId": "284882218",
      "bundleId": "com.facebook.Facebook",
      "genre": "Social Netwo
… (truncated, 2289 more chars — see transcript.json)
```

</details>

### `search_apps` 

Arguments: `{"term":"facebook","limit":3}` · 36 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,709,088 | 582.0.0 |
| 454638411 | Messenger | Meta Platforms, Inc. | 4.66 | 13,766,613 | 582.0.0 |
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,583,259 | 450.1.0 |

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
      "ratingCount": 28709088,
      "currentVersionAverageRating": 4.53,
      "currentVersionRatingCount": 28709088,
      "version": "582.0.0",
      "currentVersionReleaseDate": "2026-10-07T14:52:01Z",
      "releaseDate": "2019-02-05T08:00:00Z",
      "contentRating": "12+",
      "sizeBytes": 513508352,
      "minimumOsVersion": "15.1",
      "url": "https://apps.apple.com/us/app/facebook/id284882215",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/8a/a0/a8/8aa0a82f-fcd1-b9b4-f664-28b5389f2886/Icon-Production-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
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
      "ratingCount": 13766613,
      "currentVersionAverageRating": 4.66,
      "currentVersionRatingCount": 13766613,
      "version": "582.0.0",
      "currentVersionReleaseDate": "2026-10-06T08:36:20Z",
      "releaseDate": "2011-08-09T19:49:28Z",
      "contentRating": "12+",
      "sizeBytes": 273359872,
      "minimumOsVersion": "15.1",
      "url": "https://apps.apple.com/us/app/messenger/id454638411",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/86/e4/23/86e423d8-1d2d-737d-d1c3-e6a79bb137c2/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
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
      "ratingCount": 29583259,
      "currentVersionAverageRating": 4.69,
      "currentVersionRatingCount": 29583259,
      "version": "450.1.0",
      "currentVersionReleaseDate": "2026-10-06T12:29:07Z",
      "releaseDate": "2010-10-06T08:12:41Z",
      "contentRating": "12+",
      "sizeBytes": 623194112,
      "minimumOsVersion": "16.3",
      "url": "https://apps.apple.com/us/app/instagram/id389801252",
      "icon": "https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/30/17/93/30179310-7a32-f8b3-5b31-a01addf6c367/Prod-0-0-1x_U007epad-0-1-0-sRGB-85-220.png/512x512bb.jpg",
      "description": "Little moments lead to big friendships. Share yours on Instagram. — From Meta Connect with friends, find other fans, and see what people around you are up to and into. Explore your interests and post what's going on, from your daily moments to life's highlights. Share what you’re up to and into: -…"
    }
  ]
}
```

</details>

### `search_apps` 

Arguments: `{"term":"instagram","store":"google","limit":5}` · 337 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| com.instagram.android | Instagram | Instagram | 3.99 | 169,625,590 | – |
| com.instagram.airwave | Instagram | Instagram | 3.97 | 1,000,000+ | – |
| com.instagram.barcelona | Threads | Instagram | 4 | 500,000,000+ | – |
| com.instagram.moonshot | Instants, an Instagram app | Instagram | 4.61 | 5,000,000+ | – |
| com.snapchat.android | Snapchat | Snap Inc | 4.2 | 1,000,000,000+ | – |

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
      "ratingCount": 169625590,
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
      "averageRating": 3.97,
      "contentRating": "Teen",
      "url": "https://play.google.com/store/apps/details?id=com.instagram.airwave",
      "icon": "https://play-lh.googleusercontent.com/bh871pyeIpMnJxGYKmTJCm-5VwIYrPUYhHQcCky0B-DpsMoPCWVSDKz0Ic7MLsGuLmS4F_-iE6BilqsUM2DloA",
      "description": "Introducing Instagram for TV, bringing Reels from your favorite creators to the big screen. Watch, laugh, and enjoy together with friends and family from the comfort of your couch. With Instagram for TV, you can: • Watch Reels with others on the big screen, the easiest way to enjoy content…",
      "installs": "1,000,000+",
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
      "averageRating": 4.61,
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
      "developer": "Sn
… (truncated, 846 more chars — see transcript.json)
```

</details>

### `search_apps` 

Arguments: `{"term":"meditation","store":"google","limit":8}` · 338 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| com.spotlightsix.zentimerlite2 | Insight Timer - Meditation App | Insight Network Inc | 4.7 | 10,000,000+ | – |
| meditofoundation.medito | Medito: Meditation & Sleep | Medito for Mindfulness, Meditation and Sleep | 4.79 | 1,000,000+ | – |
| com.getsomeheadspace.android | Headspace: Sleep & Meditation | Headspace for Meditation, Mindfulness and Sleep | 4.26 | 10,000,000+ | – |
| com.elevatelabs.geonosis | Balance: Meditation & Sleep | The Mind Company | 4.64 | 1,000,000+ | – |
| com.simplehabit.simplehabitapp | Simple Habit: Meditation | Ingenio, LLC | 4.59 | 1,000,000+ | – |
| uk.co.serenity.guided.meditation | Serenity: Guided Meditation | Olson Meditation and Mindfulness Apps | 4.84 | 1,000,000+ | – |
| com.calm.android | Calm - Sleep, Meditate, Relax | Calm.com, Inc. | 4.48 | 50,000,000+ | – |
| net.workoutinc.tai_chi_meditation | Tai Chi Meditation & Breath | 7M Limited | 4.72 | 1,000+ | – |

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
      "description": "* Apps of the Year Winner - TIME magazine and Women's Health * * Happiest App in the World - Tristan Harris * The number 1 free meditation app. Guided meditations, sleep music tracks and talks led by the top meditation and mindfulness experts, neuroscientists, psychologists and teachers from…",
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
      "averageRating": 4.79,
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
      "averageRating": 4.26,
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
      "averageRating": 4.64,
      "contentRating": "Everyone",
      "url": "https://play.google.com/store/apps/details?id=com.elevatelabs.geonosis",
      "icon": "https://play-lh.googleusercontent.com/L2T8QvQ-2Bjko4G2-OFYrbxR9ar3dvvXsIwB-G7nQSMzRr3aB9s9o8gLDBjaOAn6JgLuwu2KcD8EYht8kJTx",
      "description": "Get support for whatever 2026 brings and build habits for lifelong mental health. Enhance your mental health, reduce daily anxiety and stress, improve your sleep, and increase focus with the Balance Meditation and Sleep app. Balance is a personalized program, like having a persona
… (truncated, 4075 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"284882215","country":"us","pages":2,"sort":"mostrecent"}` · 369 ms

App **284882215** (apple) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★ | 582.0.0 | 2026-10-10 | Stop auto refresh | Stop auto refreshing my feeds |
| ★★★★ | 582.0.0 | 2026-10-10 | 🚌🎬 | BusAction |
| ★★★★★ | 582.0.0 | 2026-10-10 | Delicioso | Delicias 100% natural |
| ★★★★★ | 582.0.0 | 2026-10-10 | Dope | It’s dope |
| ★ | 582.0.0 | 2026-10-10 | Most volatile ad and algorithm out there | Trash, absolute trash |

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
      "id": "14650422444",
      "author": "SKILLEDTOMATO",
      "rating": 2,
      "title": "Stop auto refresh",
      "body": "Stop auto refreshing my feeds",
      "version": "582.0.0",
      "date": "2026-10-10T09:26:21-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650350809",
      "author": "BusAction 🚌🎬",
      "rating": 4,
      "title": "🚌🎬",
      "body": "BusAction",
      "version": "582.0.0",
      "date": "2026-10-10T09:05:59-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650308845",
      "author": "yehmed",
      "rating": 5,
      "title": "Delicioso",
      "body": "Delicias 100% natural",
      "version": "582.0.0",
      "date": "2026-10-10T08:54:15-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650302823",
      "author": "TortillianExtinction757",
      "rating": 5,
      "title": "Dope",
      "body": "It’s dope",
      "version": "582.0.0",
      "date": "2026-10-10T08:52:35-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650301928",
      "author": "beiendndown",
      "rating": 1,
      "title": "Most volatile ad and algorithm out there",
      "body": "Trash, absolute trash",
      "version": "582.0.0",
      "date": "2026-10-10T08:52:19-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650259877",
      "author": "Manuel-503",
      "rating": 5,
      "title": "Me Encanta Facebook",
      "body": "Es una plataforma con muchas opciones para una gran variedad de personas con un muy buen contenido muy recomendado 👌💯",
      "version": "582.0.0",
      "date": "2026-10-10T08:40:33-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650246189",
      "author": "I had a nickname once",
      "rating": 1,
      "title": "Grumpy old man",
      "body": "AI slop",
      "version": "582.0.0",
      "date": "2026-10-10T08:36:45-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650244949",
      "author": "Forced Euphoria",
      "rating": 1,
      "title": "Can’t get in",
      "body": "They send you an EMAIL (SMS is better) code that doesn’t actually log you.",
      "version": "582.0.0",
      "date": "2026-10-10T08:36:24-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650239269",
      "author": "mikefitz98",
      "rating": 1,
      "title": "You banned my friend",
      "body": "You banned my friend. And scam",
      "version": "582.0.0",
      "date": "2026-10-10T08:34:48-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650236569",
      "author": "22ghaha",
      "rating": 1,
      "title": "Why is there no option when making a post on your phone to tag a person???",
      "body": "Bbb",
      "version": "582.0.0",
      "date": "2026-10-10T08:34:05-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650234829",
      "author": "Microsoft Ib",
      "rating": 5,
      "title": "Coverage",
      "body": "Wider range compared to other social media platforms",
      "version": "582.0.0",
      "date": "2026-10-10T08:33:37-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650218846",
      "author": "N.Y.human",
      "rating": 1,
      "title": "Thought police",
      "body": "Facebook uses algorithms which key on words which they often  misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded.",
      "version": "582.0.0",
      "date": "2026-10-10T08:29:14-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650165169",
      "author": "MLnine
… (truncated, 33294 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"389801252","country":"us","pages":2,"sort":"mostrecent"}` · 448 ms

App **389801252** (apple) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★ | 450.1.0 | 2026-10-10 | Terrible UI | Nobody likes this app. It makes sharing simple things really difficult.  But that is the trap. They make it difficult to keep people on the … |
| ★ | 450.1.0 | 2026-10-10 | Fix Reels!!!  Tiny window | New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡 |
| ★★★★★ | 450.1.0 | 2026-10-10 | The best app | What can I say it’s IG!!!!!🔥🔥🔥🔥🔥 |
| ★★★★★ | 450.1.0 | 2026-10-10 | Best app | codes_gotthekeys followed me I will follow back instantly and let’s grow anyone that see this please help me get followers |
| ★ | 450.1.0 | 2026-10-10 | . | The new ‘Shop the Look’ button is ruining Reels. It sits right where you double-tap to like a video, so I keep accidentally tapping it and o… |

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
      "id": "14650422295",
      "author": "Oh Von Braun",
      "rating": 1,
      "title": "Terrible UI",
      "body": "Nobody likes this app. It makes sharing simple things really difficult.  But that is the trap. They make it difficult to keep people on the platform for their shareholders to profit from. Look for alternatives asap",
      "version": "450.1.0",
      "date": "2026-10-10T09:26:18-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650404979",
      "author": "mmd9604",
      "rating": 1,
      "title": "Fix Reels!!!  Tiny window",
      "body": "New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡",
      "version": "450.1.0",
      "date": "2026-10-10T09:21:22-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650373815",
      "author": "Marquez89",
      "rating": 5,
      "title": "The best app",
      "body": "What can I say it’s IG!!!!!🔥🔥🔥🔥🔥",
      "version": "450.1.0",
      "date": "2026-10-10T09:12:28-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650338019",
      "author": "Joseisthe8",
      "rating": 5,
      "title": "Best app",
      "body": "codes_gotthekeys followed me I will follow back instantly and let’s grow anyone that see this please help me get followers",
      "version": "450.1.0",
      "date": "2026-10-10T09:02:24-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650333233",
      "author": "Loji667",
      "rating": 1,
      "title": ".",
      "body": "The new ‘Shop the Look’ button is ruining Reels. It sits right where you double-tap to like a video, so I keep accidentally tapping it and opening shopping pages instead of liking. Please move it away from the like zone, remove it entirely, or at least give users the option to turn it off.",
      "version": "450.1.0",
      "date": "2026-10-10T09:01:05-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650280134",
      "author": "strry.n1ght",
      "rating": 4,
      "title": "I’m irritated",
      "body": "I have not gotten instants or any updates of the new updates and half the time I’m straight up just not able to repost 🫩🫩",
      "version": "450.1.0",
      "date": "2026-10-10T08:46:15-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650263336",
      "author": "Saloniiiee",
      "rating": 1,
      "title": "Worst app !!!!",
      "body": "Absolutely terrible experience! Instagram suspends accounts without proper explanations and provides zero helpful customer support. Even after submitting an appeal and verifying my identity, there is no resolution. Years of memories and connections can disappear, and Instagram doesn’t even care enough to respond. Worst customer service ever!",
      "version": "450.1.0",
      "date": "2026-10-10T08:41:32-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650228003",
      "author": "Thick Bob :)",
      "rating": 3,
      "title": "Remove that new shop similar button",
      "body": "I love ig reels but that new button is so annoying",
      "version": "450.1.0",
      "date": "2026-10-10T08:31:46-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650210165",
      "author": "cj de la O",
      "rating": 4,
      "title": "Glitchy",
      "body": "I wish The Gram would fix some of the glitches on the REELS section, and be more open to fixing fraud!",
      "version": "450.1.0",
      "date": "2026-10-10T08:26:51-07:00",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "14650201277",
      "author": "katandcats",
      "rating": 1,
      "title": 
… (truncated, 37233 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"https://apps.apple.com/us/app/instagram/id389801252","sort":"mosthelpful"}` · 529 ms

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

Arguments: `{"app_id":"com.spotify.music","pages":2}` · 138 ms

App **com.spotify.music** (google) · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★ | 9.1.90.2270 | 2026-10-10 |  | I love spotify. Even without paid subscriptions, the app is still enjoyable for all users including myself. However, for the past several we… |
| ★★★★★ | 9.1.90.2270 | 2026-10-10 |  | the goat |
| ★★★★★ | 9.1.90.2270 | 2026-10-10 |  | good |
| ★★★★★ | 9.1.90.2270 | 2026-10-10 |  | I just like using Spotify |
| ★★ | 9.1.80.2221 | 2026-10-10 |  | TOOOOOOOOOOO much ads!!!☹️ |

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
      "id": "27458088-8bb3-4508-acf8-e9f0cd7ae0d0",
      "author": "Eden",
      "rating": 2,
      "title": "",
      "body": "I love spotify. Even without paid subscriptions, the app is still enjoyable for all users including myself. However, for the past several weeks it simply has stopped functioning properly. Ads cause the ENTIRE app to stop working. Music plays fine, but most of the time when an ad plays it freezes the entire app. All media stops playing. The only way to fix it is to close the app and reopen it, which has made it impossible to walk away from my phone while listening to music. Please fix this!!!",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:42:19.000Z",
      "helpfulVotes": 2,
      "totalVotes": 2,
      "developerReply": "Hi. Thanks for sharing this with us. For the app's behavior, you can try a quick reinstall. If that doesn't help, we'd recommend reaching out to our Customer Service at support.spotify.com. Just search \"Contact Us\", and they'll be happy to help."
    },
    {
      "id": "69efe0a6-ee66-424f-b442-67a5077e89b5",
      "author": "Ben Andreassen",
      "rating": 5,
      "title": "",
      "body": "the goat",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:42:13.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "45f648c3-7efa-47f8-afe0-271aa32539d8",
      "author": "Love Elias",
      "rating": 5,
      "title": "",
      "body": "good",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:41:20.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "ff970640-22ad-4bd7-8c02-de4fda5289e1",
      "author": "Morrison Maxwell",
      "rating": 5,
      "title": "",
      "body": "I just like using Spotify",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:38:32.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "abf0ad6b-fdac-462e-9458-5abf098b67de",
      "author": "Jenna Kim",
      "rating": 2,
      "title": "",
      "body": "TOOOOOOOOOOO much ads!!!☹️",
      "version": "9.1.80.2221",
      "date": "2026-10-10T21:36:39.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0,
      "developerReply": "Hi. We appreciate your feedback, and we'll pass it along to the Ads team. For an ad-free experience, we'd recommend checking out our Premium plans at spotify.com/premium. If you've never had Premium before, you should be eligible for our trial."
    },
    {
      "id": "76448e0a-675c-40c7-b29b-5797800482ee",
      "author": "Gabriel Ortega",
      "rating": 5,
      "title": "",
      "body": "App muy funcional y en cuanto a la calidad no me importa si no es Lossless, funciona muy bien en todos los dispositivos.",
      "version": "9.1.88.2204",
      "date": "2026-10-10T21:32:26.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "a4509930-93b8-4a40-894d-784e8ed1c5ea",
      "author": "Evan Gibbs",
      "rating": 5,
      "title": "",
      "body": "I love this app",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:31:33.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "6ecb1783-f463-4857-ae62-6305b3e9af7a",
      "author": "Hilary Gwilt",
      "rating": 5,
      "title": "",
      "body": "my experience with Spotify has been great so far meaning that; a few months ago I noticed that one of my playlist was not working properly. I contacted Spotify via email. and they were very helpful in fixing the problem due to a lot of bugs on their end too.",
      "version": "9.1.90.2270",
      "date": "2026-10-10T21:30:08.000Z",
      "helpfulVotes": 0,
      "totalVotes": 0
    },
    {
      "id": "59ca9929-8275-44a1-9f38-56b0320911a3",
      "author": "Soumya Gupta",
      "rating": 4,
      "title": "",
      "body": "
… (truncated, 37475 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"https://play.google.com/store/apps/details?id=com.instagram.android&hl=en","sort":"mosthelpful"}` · 127 ms

App **com.instagram.android** (google) · us · sort=mosthelpful · pages fetched 1/1 · **50 reviews**

| rating | version | date | title | body |
|---|---|---|---|---|
| ★★ | 434.0.0.44.74 | 2026-09-19 |  | It will not let you see the content you want. I have changed my algorithm 20 times and it absolutely will not show me art. I get cats and ra… |
| ★ | 362.0.0.33.241 | 2025-01-12 |  | The new update is so buggy. Let's say I am going to post 5 photos, and I select to zoom them out so they aren't so close to my face. I can o… |
| ★ | 378.0.0.52.68 | 2025-05-04 |  | if you send someone a link to a post now, it will have your profile attached to it, even if it wasn't your post. they get a popup with whate… |
| ★★ | 388.0.0.34.75 | 2025-07-16 |  | The video calling on this app is hardly worth using. Each time I've used it, the video quality gets super pixilated and grainy anytime the s… |
| ★ | 361.0.0.46.88 | 2024-12-19 |  | Every time I start using Instagram again I remember why I don't. Every single time I'm on reels and scrolling, eventually the videos will on… |

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
      "helpfulVotes": 7,
      "totalVotes": 7
    },
    {
      "id": "045b1b4e-b207-40f7-8a9e-d4e81664965e",
      "author": "Logan Chesley",
      "rating": 1,
      "title": "",
      "body": "The new update is so buggy. Let's say I am going to post 5 photos, and I select to zoom them out so they aren't so close to my face. I can only zoom out one, and if I select more than 1 photo, it unzooms all of them. It has never done this before. The comments and notifications are weird as well. They glitch out, and when I go to click on the notification in the app, it doesn't let me, or it takes multiple times for it to work and bring me to where I need to be. Hope they fix this soon.",
      "version": "362.0.0.33.241",
      "date": "2025-01-12T22:37:55.000Z",
      "helpfulVotes": 10200,
      "totalVotes": 10200
    },
    {
      "id": "6616cf3d-e733-4afc-8d45-19fd62888615",
      "author": "Shanna Wallace",
      "rating": 1,
      "title": "",
      "body": "if you send someone a link to a post now, it will have your profile attached to it, even if it wasn't your post. they get a popup with whatever account you were logged in to prompting them to follow it. instagram made this change without any notification. details of your profile should not be attached when you copy / paste a link to a post that wasn't even yours, especially when you have all options to make your account visible to contacts / searchable by email disabled.",
      "version": "378.0.0.52.68",
      "date": "2025-05-04T22:46:55.000Z",
      "helpfulVotes": 11326,
      "totalVotes": 11326
    },
    {
      "id": "6b217418-8595-40e4-bab1-ebdccb12e377",
      "author": "Jasper Ransom",
      "rating": 2,
      "title": "",
      "body": "The video calling on this app is hardly worth using. Each time I've used it, the video quality gets super pixilated and grainy anytime the service isn't exactly *perfect*. The calls also take way too much battery power, quickly heat up the phone, and have overheated the phone before. Having video call functionality is great, but when it's so cumbersome and not worth using, what's the point?",
      "version": "388.0.0.34.75",
      "date": "2025-07-16T17:41:55.000Z",
      "helpfulVotes": 12092,
      "totalVotes": 12092
    },
    {
      "id": "451f3c87-6d30-4399-8c7f-e22e2fd9f458",
      "author": "Madison Walker",
      "rating": 1,
      "title": "",
      "body": "Every time I start using Instagram again I remember why I don't. Every single time I'm on reels and scrolling, eventually the videos will only play halfway and then don't play the rest of the video. It's not a connection issue and I've been dealing with this ever since reels came out. I don't want to watch half a video just for it to cut off.",
      "version": "361.0.0.46.88",
      "date": "2024-12-19T21:56:09.000Z",
      "helpfulVotes": 3946,
      "totalVotes": 3946
    },
    {
      "id": "f7bfc0af-c905-4533-8ce5-94222cc61161",
      "author": "Kyle Nichols",
      "rating": 1,
      "title": "",
      "body": "With the latest update, you can no longer be logged in to more than one account. I've seen no improvements with the last few updates other than the layout, which didn't need fixing, and the logo change. The app used to scroll through my feed smoother too, a thing of t
… (truncated, 31352 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"284882215","countries":["us","gb"],"pages":3}` · 691 ms

**Facebook** (284882215, apple) — sample of 300 recent reviews {"us":150,"gb":150}, 2026-10-01 → 2026-10-10

Store rating: **4.53** over 28,709,088 ratings · Sample average: **2.93**

| ★ | count | % |
|---|---|---|
| 5 | 114 | 38% |
| 4 | 16 | 5.3% |
| 3 | 23 | 7.7% |
| 2 | 28 | 9.3% |
| 1 | 119 | 39.7% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 582.0.0 | 203 | 3.1 | 43.8% |
| 581.0.0 | 97 | 2.57 | 59.8% |

**What changed (basis: version, confidence: high)** — Version 582.0.0 (203 reviews) average 3.10★ vs 2.57★ for previous version 581.0.0 (97 reviews), +0.53; negative share 43.8% vs 59.8% (−16 pp). Rising complaints: "ads" (+10.4 pp, 22.5% of negative reviews), "feed" (+7.3 pp, 9% of negative reviews), "watch" (new, 5.6% of negative reviews).


| rising complaint | status | latest share | previous share | change | example |
|---|---|---|---|---|---|
| ads | increased | 22.5% | 12.1% | +10.4 pp | Trash. Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything bu |
| feed | increased | 9.0% | 1.7% | +7.3 pp | Too many ads. Unsolicited ads and people in feed not interested in! |
| watch | new | 5.6% | 0.0% | +5.6 pp | …world only to find out fb can take over your phone and listen and watch everything you do is not right. To try and find out where to go to turn it all of is next to impossible too. Why can’t things be |
| comments | increased | 6.7% | 1.7% | +5.0 pp | …ted them and Facebook said they didn’t see a reason to take their comments down! Also i’ve had harassing comments from Muslims and Facebook said they didn’t find any wrongdoings and will not take thei |
| account | increased | 10.1% | 5.2% | +4.9 pp | …ey on words which they often misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded. |
| view | new | 4.5% | 0.0% | +4.5 pp | …ngs. They have removed or hidden the feature for me to filter and view only local only listings. The user interface is slick and is nothing less than what I would expect from a multi billion dollar co |
| amount | new | 4.5% | 0.0% | +4.5 pp | Aggressive ads. Recently implemented an aggressive amount of ads every 30 seconds while watching videos. |
| happens | new | 4.5% | 0.0% | +4.5 pp | …uidelines against anything hateful, but try reporting and nothing happens |

**Top complaint keywords (1–2★, n=147)**

| phrase | reviews | share | example |
|---|---|---|---|
| ads | 27 | 18.4% | Trash. Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything bu |
| post | 26 | 17.7% | Why is there no option when making a post on your phone to tag a person???. Bbb |
| friends | 19 | 12.9% | …that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they ca |
| videos | 16 | 10.9% | Propaganda. Es muy aburrido ver los videos porque siempre son interrumpidos por publicidad!!! Y video tras video lo mismo. |
| reels | 15 | 10.2% | …I don’t want to have to search for my normal feed. Why start with reels of people I don’t know or care about. The constant ads are bad enough this may be the thing that makes me delete this app. |
| ai | 13 | 8.8% | Grumpy old man. AI slop |
| account | 12 | 8.2% | …ey on words which they often misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded. |
| content | 11 | 7.5% | TrashBook. Fraud Employees that are ruining good content for their own selfish gain |
| page | 9 | 6.1% | …Z. do not even show YOUR FRIENDS anymore you have to go to their Page if you want to see them OR they stuff show up DAYS LATER, so TACKY so I am not happy with Facebook at all 😡😡😡😡😡🤬🤬🤬🤬🤬🤬� |
| feed | 9 | 6.1% | …seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they care enough to change it either. So disappointing. |
| marketplace | 8 | 5.4% | Selling Activity tab on FB marketplace Defective. I mainly use this app for buying and selling on the marketplace. Lately, when I select the 'Selling Activity' tab, all of the content there disappears |
| stop | 8 | 5.4% | Stop auto refresh. Stop auto refreshing my feeds |
| experience | 8 | 5.4% | …pect from a multi billion dollar company. With that said the user experience leaves a lot to be desired. This app is a soft 1.7 or maybe a 2 at best out of five. |
| feel | 8 | 5.4% | FACEBOOK. I don’t feel safe Facebook has turned this , mean , so called “BE FREE” world into a I can’t even describe. That is all I’m going now GOD BLESS US ALL. |
| comments | 7 | 4.8% | …ted them and Facebook said they didn’t see a reason to take their comments down! Also i’ve had harassing comments from Muslims and Facebook said they didn’t find any wrongdoings and will not take thei |

**Sample quotes**

> ★ **Thought police** — Facebook uses algorithms which key on words which they often misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded. _(v582.0.0, us, 2026-10-10)_
>
> ★ **Trash** — Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they care enough to change it either. So disappointing. _(v582.0.0, us, 2026-10-10)_
>
> ★ **Usefulness** — It seems to me Facebook started out as a unique way to stay in communication with people you wanted to stay and communication with. But it has increasingly become a means of people you don’t want to communicate with communicating with you. It has become almost as useless and… _(v582.0.0, us, 2026-10-10)_
>
> ★★★★ **Facebook v2?** — For years it was just friends but suddenly it’s all about organisations I’ve never heard of or care about _(v582.0.0, gb, 2026-10-07)_
>
> ★★★★★ **Me Encanta Facebook** — Es una plataforma con muchas opciones para una gran variedad de personas con un muy buen contenido muy recomendado 👌💯 _(v582.0.0, us, 2026-10-10)_
>
> ★★★★★ **People oriented** — DoorDash has connected me with a lot of family members and friends that I would not know how to find if it was not for Facebook. I have found family members that have been looking for me and looking for other family members and it’s wonderful. Also, I’m still connected with a… _(v582.0.0, us, 2026-10-10)_
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
    "ratingCount": 28709088,
    "version": "582.0.0",
    "currentVersionReleaseDate": "2026-10-07T14:52:01Z",
    "url": "https://apps.apple.com/us/app/facebook/id284882215"
  },
  "store": "apple",
  "sample": {
    "reviews": 300,
    "negativeReviews": 147,
    "positiveReviews": 130,
    "pagesFetched": 6,
    "byCountry": {
      "us": 150,
      "gb": 150
    },
    "dateRange": {
      "from": "2026-10-01T03:35:29-07:00",
      "to": "2026-10-10T09:26:21-07:00"
    },
    "note": "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 119,
      "2": 28,
      "3": 23,
      "4": 16,
      "5": 114
    },
    "percent": {
      "1": 39.7,
      "2": 9.3,
      "3": 7.7,
      "4": 5.3,
      "5": 38
    },
    "average": 2.93,
    "total": 300
  },
  "storeRating": {
    "averageRating": 4.53,
    "ratingCount": 28709088
  },
  "ratingByVersion": [
    {
      "version": "582.0.0",
      "reviews": 203,
      "averageRating": 3.1,
      "negativeShare": 0.438,
      "firstSeen": "2026-10-07T07:56:17-07:00",
      "lastSeen": "2026-10-10T09:26:21-07:00"
    },
    {
      "version": "581.0.0",
      "reviews": 97,
      "averageRating": 2.57,
      "negativeShare": 0.598,
      "firstSeen": "2026-10-01T03:35:29-07:00",
      "lastSeen": "2026-10-07T06:26:32-07:00"
    }
  ],
  "versionDeltas": {
    "basis": "version",
    "latest": {
      "label": "582.0.0",
      "versions": [
        "582.0.0"
      ],
      "reviews": 203,
      "negativeReviews": 89,
      "averageRating": 3.1,
      "negativeShare": 0.438,
      "dateRange": {
        "from": "2026-10-07T07:56:17-07:00",
        "to": "2026-10-10T09:26:21-07:00"
      }
    },
    "previous": {
      "label": "previous version 581.0.0",
      "versions": [
        "581.0.0"
      ],
      "reviews": 97,
      "negativeReviews": 58,
      "averageRating": 2.57,
      "negativeShare": 0.598,
      "dateRange": {
        "from": "2026-10-01T03:35:29-07:00",
        "to": "2026-10-07T06:26:32-07:00"
      }
    },
    "change": {
      "averageRating": 0.53,
      "negativeShare": -0.16
    },
    "whatGotWorse": [
      {
        "phrase": "ads",
        "status": "increased",
        "latestShare": 0.225,
        "previousShare": 0.121,
        "change": 0.104,
        "latestReviews": 20,
        "previousReviews": 7,
        "examples": [
          {
            "rating": 1,
            "title": "Trash",
            "text": "Trash. Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything bu",
            "author": "MLninenine",
            "version": "582.0.0",
            "date": "2026-10-10T08:14:24-07:00",
            "country": "us"
          },
          {
            "rating": 2,
            "title": "Impersonal",
            "text": "Impersonal. I get so many ads & far fewer feeds from FB friends!",
            "author": "Plus drugs",
            "version": "582.0.0",
            "date": "2026-10-10T07:07:39-07:00",
            "country": "us"
          }
        ]
      },
      {
        "phrase": "feed",
        "status": "increased",
        "latestShare": 0.09,
        "previousShare": 0.017,
        "change": 0.073,
        "latestReviews": 8,
        "previousReviews": 1,
        "examples": [
          {
            "rating": 1,
            "title": "Too many ads",
            "text": "Too many ads. Unsolicited ads and people in feed not interested in!",
            "author": "SEATHROUGHHEART",
            "version": "582.0.0",
            "date": "2026-10-10T06:34:20-07:00",
            "country": "us"
          },
          {
            "rating": 1
… (truncated, 15448 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"389801252","countries":["us","gb"],"pages":3}` · 922 ms

**Instagram** (389801252, apple) — sample of 300 recent reviews {"us":150,"gb":150}, 2026-09-26 → 2026-10-10

Store rating: **4.69** over 29,583,259 ratings · Sample average: **2.42**

| ★ | count | % |
|---|---|---|
| 5 | 86 | 28.7% |
| 4 | 9 | 3% |
| 3 | 17 | 5.7% |
| 2 | 20 | 6.7% |
| 1 | 168 | 56% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 450.1.0 | 210 | 2.17 | 69.5% |
| 450.0.0 | 4 | 3.25 | 50.0% |
| 449.0.0 | 21 | 3.57 | 28.6% |
| 448.0.0 | 65 | 2.8 | 52.3% |

**What changed (basis: version, confidence: high)** — Version 450.1.0 (210 reviews) average 2.17★ vs 3.00★ for previous versions 448.0.0–450.0.0 (90 reviews), −0.83; negative share 69.5% vs 46.7% (+22.8 pp). Rising complaints: "ipad" (new, 24% of negative reviews), "reels" (+18.6 pp, 28.1% of negative reviews), "screen" (+17.5 pp, 19.9% of negative reviews).


| rising complaint | status | latest share | previous share | change | example |
|---|---|---|---|---|---|
| ipad | new | 24.0% | 0.0% | +24.0 pp | iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen. |
| reels | increased | 28.1% | 9.5% | +18.6 pp | Fix the display of reels. Why did Instagram change display of reels from full screen to cropped square display? I guess they’re testing methods to keep people from doom-scrolling, because now I don’t |
| screen | increased | 19.9% | 2.4% | +17.5 pp | …search come up as pop up squares rather than the entire vertical screen. Now I can’t see the reel in its entirety. A really poor update decision. |
| full screen | new | 11.0% | 0.0% | +11.0 pp | …te ruins video viewing on iPad. Instead of playing videos cleanly full-screen, it opens them in a small floating box overlay where comment previews and text boxes float right over the video itself. It |
| video | increased | 17.8% | 7.1% | +10.7 pp | …wnloaded it the saved stuff keeps popping up every time I saved a video and it’s starting to get annoying please can you fix it |
| square | new | 8.9% | 0.0% | +8.9 pp | …t update, when I search from the home page, reels open as a small square pop-up in the middle of the screen, with the posts still visible behind it. I can't see the whole reel, and it's cropped. Befor |
| watch | new | 7.5% | 0.0% | +7.5 pp | …video viewing option on Instagram. Currently, there is no way to watch videos in full screen, which takes away from the viewing experience. Adding this feature would make it much easier to enjoy vide |
| search | new | 7.5% | 0.0% | +7.5 pp | Fix search for iPad. Search in the iPad app has become unusable. Reels a placed in a small window that cuts off the top and bottom and some don’t even load. |

**Top complaint keywords (1–2★, n=188)**

| phrase | reviews | share | example |
|---|---|---|---|
| reels | 45 | 23.9% | iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen. |
| ipad | 35 | 18.6% | iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen. |
| account | 34 | 18.1% | …hilds app. Everything thats even a bit edgy gets flagged and your account is shadow banned. It doesnt even have to include any explicit material. Stupid af, it fell off hard. Same think with Diktok. |
| screen | 30 | 16.0% | iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen. |
| video | 29 | 15.4% | …wnloaded it the saved stuff keeps popping up every time I saved a video and it’s starting to get annoying please can you fix it |
| posts | 25 | 13.3% | …smaller screen. Please fix. Also, please add a tab that separates posts from reels from profiles we follow. Sometimes seeing too many reels back to back is overstimulating |
| full screen | 16 | 8.5% | …display of reels. Why did Instagram change display of reels from full screen to cropped square display? I guess they’re testing methods to keep people from doom-scrolling, because now I don’t want to |
| reason | 18 | 9.6% | This app sucks. You keep getting suspended for no reason There are weird people stalking and follow you People get into your accounts |
| ai | 14 | 7.4% | AI and Ads. ENOUGH ITS UNUSABLE |
| window | 14 | 7.4% | New ui is bad. Modal window views of post is glitchy and annoying. Revert revert revert |
| content | 13 | 6.9% | …rience. It is an awful, poorly optimized design change that makes content impossible to look at comfortably and smaller. Because of this terrible layout, I have officially stopped using the app |
| small | 13 | 6.9% | …cant Improvement. I hate how on the iPad now, the reels open in a small, screen when I click on them. Before, it would full screen. Not the reels get cut off in the smaller screen. Please fix. Also, p |
| square | 13 | 6.9% | Latest update is awful. The latest update for iPad is terrible, opened reels in a tiny square aspect and ruins the whole experience. This needs to be fixed asap |
| platform | 12 | 6.4% | …ut that is the trap. They make it difficult to keep people on the platform for their shareholders to profit from. Look for alternatives asap |
| change | 12 | 6.4% | Fix the display of reels. Why did Instagram change display of reels from full screen to cropped square display? I guess they’re testing methods to keep people from doom-scrolling, because now I don’t |

**Sample quotes**

> ★ **iPad Update Ruined Reels** — Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen. _(v450.1.0, us, 2026-10-09)_
>
> ★ **Latest update is awful** — The latest update for iPad is terrible, opened reels in a tiny square aspect and ruins the whole experience. This needs to be fixed asap _(v450.1.0, us, 2026-10-09)_
>
> ★ **Fix the display of reels** — Why did Instagram change display of reels from full screen to cropped square display? I guess they’re testing methods to keep people from doom-scrolling, because now I don’t want to use Instagram anymore. Well done! _(v450.1.0, us, 2026-10-09)_
>
> ★★★★★ **Best app** — codes_gotthekeys followed me I will follow back instantly and let’s grow anyone that see this please help me get followers _(v450.1.0, us, 2026-10-10)_
>
> ★★★★ **I’m irritated** — I have not gotten instants or any updates of the new updates and half the time I’m straight up just not able to repost 🫩🫩 _(v450.1.0, us, 2026-10-10)_
>
> ★★★★ **Glitchy** — I wish The Gram would fix some of the glitches on the REELS section, and be more open to fixing fraud! _(v450.1.0, us, 2026-10-10)_
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
    "ratingCount": 29583259,
    "version": "450.1.0",
    "currentVersionReleaseDate": "2026-10-06T12:29:07Z",
    "url": "https://apps.apple.com/us/app/instagram/id389801252"
  },
  "store": "apple",
  "sample": {
    "reviews": 300,
    "negativeReviews": 188,
    "positiveReviews": 95,
    "pagesFetched": 6,
    "byCountry": {
      "us": 150,
      "gb": 150
    },
    "dateRange": {
      "from": "2026-09-26T13:04:44-07:00",
      "to": "2026-10-10T09:26:18-07:00"
    },
    "note": "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 168,
      "2": 20,
      "3": 17,
      "4": 9,
      "5": 86
    },
    "percent": {
      "1": 56,
      "2": 6.7,
      "3": 5.7,
      "4": 3,
      "5": 28.7
    },
    "average": 2.42,
    "total": 300
  },
  "storeRating": {
    "averageRating": 4.69,
    "ratingCount": 29583259
  },
  "ratingByVersion": [
    {
      "version": "450.1.0",
      "reviews": 210,
      "averageRating": 2.17,
      "negativeShare": 0.695,
      "firstSeen": "2026-10-06T06:12:33-07:00",
      "lastSeen": "2026-10-10T09:26:18-07:00"
    },
    {
      "version": "450.0.0",
      "reviews": 4,
      "averageRating": 3.25,
      "negativeShare": 0.5,
      "firstSeen": "2026-10-05T08:25:42-07:00",
      "lastSeen": "2026-10-06T03:52:26-07:00"
    },
    {
      "version": "449.0.0",
      "reviews": 21,
      "averageRating": 3.57,
      "negativeShare": 0.286,
      "firstSeen": "2026-10-02T22:09:28-07:00",
      "lastSeen": "2026-10-05T03:46:08-07:00"
    },
    {
      "version": "448.0.0",
      "reviews": 65,
      "averageRating": 2.8,
      "negativeShare": 0.523,
      "firstSeen": "2026-09-26T13:04:44-07:00",
      "lastSeen": "2026-10-02T12:39:54-07:00"
    }
  ],
  "versionDeltas": {
    "basis": "version",
    "latest": {
      "label": "450.1.0",
      "versions": [
        "450.1.0"
      ],
      "reviews": 210,
      "negativeReviews": 146,
      "averageRating": 2.17,
      "negativeShare": 0.695,
      "dateRange": {
        "from": "2026-10-06T06:12:33-07:00",
        "to": "2026-10-10T09:26:18-07:00"
      }
    },
    "previous": {
      "label": "previous versions 448.0.0–450.0.0",
      "versions": [
        "450.0.0",
        "449.0.0",
        "448.0.0"
      ],
      "reviews": 90,
      "negativeReviews": 42,
      "averageRating": 3,
      "negativeShare": 0.467,
      "dateRange": {
        "from": "2026-09-26T13:04:44-07:00",
        "to": "2026-10-06T03:52:26-07:00"
      }
    },
    "change": {
      "averageRating": -0.83,
      "negativeShare": 0.228
    },
    "whatGotWorse": [
      {
        "phrase": "ipad",
        "status": "new",
        "latestShare": 0.24,
        "previousShare": 0,
        "change": 0.24,
        "latestReviews": 35,
        "previousReviews": 0,
        "examples": [
          {
            "rating": 1,
            "title": "iPad Update Ruined Reels",
            "text": "iPad Update Ruined Reels. Tiny, unchangeable aspect ratio that hovers over the search page? Horrible UI and experience. Half the time they don’t even load and it’s just a black screen.",
            "author": "Sad iPad User lol",
            "version": "450.1.0",
            "date": "2026-10-09T13:38:21-07:00",
            "country": "us"
          },
          {
            "rating": 1,
            "title": "Latest update is awful",
            "text": "Latest update is awful. The latest update for iPad is terrible, opened reels in a tiny square aspect and ruins the whole experience. This needs to be fixed asap",
            "author": "Allupinyuhmc79",
            "version": "450.1.0",
            "date": "2026-10-09T10:16:01-07:00",
            "country": "us"
          }
        ]
      },
      {
        "phrase
… (truncated, 16126 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"com.instagram.android","pages":6,"quotes":2}` · 751 ms

**Instagram** (com.instagram.android, google) — sample of 300 recent reviews {"us":300}, 2026-10-08 → 2026-10-08

Store rating: **3.99** over 169,625,581 ratings · Sample average: **4.02**

| ★ | count | % |
|---|---|---|
| 5 | 202 | 67.3% |
| 4 | 21 | 7% |
| 3 | 11 | 3.7% |
| 2 | 13 | 4.3% |
| 1 | 53 | 17.7% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 451.0.0.0.64 | 1 | 1 | 100.0% |
| 450.0.0.50.77 | 88 | 3.73 | 29.5% |
| 449.0.0.52.84 | 37 | 4.3 | 13.5% |
| 448.0.0.52.84 | 16 | 4.31 | 12.5% |
| 447.0.0.55.81 | 8 | 4.75 | 0.0% |
| 446.0.0.49.77 | 8 | 4.5 | 12.5% |
| 445.0.0.45.83 | 4 | 5 | 0.0% |
| 444.0.0.46.85 | 5 | 3.2 | 40.0% |

**What changed (basis: version, confidence: low)** — Version 450.0.0.50.77 and newer (89 reviews) average 3.70★ vs 4.30★ for previous version 449.0.0.52.84 (37 reviews), −0.60; negative share 30.3% vs 13.5% (+16.8 pp). Rising complaints: "post" (new, 14.8% of negative reviews), "request" (new, 11.1% of negative reviews), "suspended" (new, 11.1% of negative reviews). Low confidence: few negative reviews in one of the periods.


| rising complaint | status | latest share | previous share | change | example |
|---|---|---|---|---|---|
| post | new | 14.8% | 0.0% | +14.8 pp | …onsistently upheld Instagram’s Community Standards. The content I post consists solely of personal life updates, which are cross-posted to Facebook without any violations or policy warnings. ​I reques |
| request | new | 11.1% | 0.0% | +11.1 pp | …ear problem sir okay time is 12:25 this today evening or tomorrow request the account give me sir thank you 🥲 |
| suspended | new | 11.1% | 0.0% | +11.1 pp | …s it suspends my account without any reason.in 4 5 days instagram suspended my 4 ID's without any valid reason however I am following all the guidelines and community terms and conditions. very bad. t |
| video | new | 11.1% | 0.0% | +11.1 pp | Device banned my iQOO phone for 2 months. Video selfie done. All help forms removed. @moolchandkumar123 Meta AI bot useless. Fix IMEI blacklist. |
| community | new | 11.1% | 0.0% | +11.1 pp | …ut any valid reason however I am following all the guidelines and community terms and conditions. very bad. thing is this |
| disabled | new | 11.1% | 0.0% | +11.1 pp | Instagram just disabled my account, and honestly, it hurts so much. I put a lot of time and effort into building that account, making it look good, and creating so many memories there. It wasn't just |
| bugs | new | 7.4% | 0.0% | +7.4 pp | has a lot of bugs |
| name | new | 7.4% | 0.0% | +7.4 pp | My account has deactivated please reactivate it soon id name (mr_classy____07) |

**Top complaint keywords (1–2★, n=66)**

| phrase | reviews | share | example |
|---|---|---|---|
| account | 23 | 34.8% | ❗️❗️instagram became a bad app for me I can't log into my account it's why? I don't know they just wrote we disabled your account what's fault,I'm just wanted to clear my account from a human who i wa |
| suspended | 10 | 15.2% | …s it suspends my account without any reason.in 4 5 days instagram suspended my 4 ID's without any valid reason however I am following all the guidelines and community terms and conditions. very bad. t |
| suspend | 7 | 10.6% | my account many time suspend please take action and slove my issue |
| disabled | 6 | 9.1% | …n't log into my account it's why? I don't know they just wrote we disabled your account what's fault,I'm just wanted to clear my account from a human who i wanted to unfollow that is i unfollowed,inst |
| reason | 6 | 9.1% | …lication. every two three days it suspends my account without any reason.in 4 5 days instagram suspended my 4 ID's without any valid reason however I am following all the guidelines and community term |
| issue | 5 | 7.6% | …and gives me a chance to get it back. Please report/ review this issue because I don't want to lose everything I worked so hard for. harsh_jhanginiya11 |
| years | 5 | 7.6% | …in sudden action without proper verification. An account can hold years of memories, photos, and personal effort. Please ensure a fair review to identify who is actually at fault and protect genuine u |
| users | 5 | 7.6% | …r review to identify who is actually at fault and protect genuine users from wrongful suspension or deletion. |
| meta | 5 | 7.6% | Device banned my iQOO phone for 2 months. Video selfie done. All help forms removed. @moolchandkumar123 Meta AI bot useless. Fix IMEI blacklist. |
| post | 4 | 6.1% | …onsistently upheld Instagram’s Community Standards. The content I post consists solely of personal life updates, which are cross-posted to Facebook without any violations or policy warnings. ​I reques |
| request | 4 | 6.1% | …-posted to Facebook without any violations or policy warnings. ​I request a manual review by an actual human specialist. An authentic check of my posts. |
| action | 4 | 6.1% | my account many time suspend please take action and slove my issue |
| problem | 4 | 6.1% | …account sir and very important work and family or friend s shear problem sir okay time is 12:25 this today evening or tomorrow request the account give me sir thank you 🥲 |
| ai | 4 | 6.1% | bad app they disable my all id's and if this is their service when i haven't did anything wrong still banning my id they should change it there is huge glitch in their AI!!!!! i'm very disappointed😡 |
| community guidelines | 3 | 4.5% | …ch not sharing anything that violets instagram privacy policy and community guidelines,but this stupid system sending me restriction in every 2 days. My previous account was suspended and i create a n |

**Sample quotes**

> ★ ❗️❗️instagram became a bad app for me I can't log into my account it's why? I don't know they just wrote we disabled your account what's fault,I'm just wanted to clear my account from a human who i wanted to unfollow that is i unfollowed,instagram disabled my account there's no… _(v444.0.0.46.85, us, 2026-10-08)_
>
> ★ Instagram just disabled my account, and honestly, it hurts so much. I put a lot of time and effort into building that account, making it look good, and creating so many memories there. It wasn't just an account to me-it had so many moments, photos conversations, and memories… _(v450.0.0.50.77, us, 2026-10-08)_
>
> ★★★★★ Instagram is one of the best social media platforms out there! It is user-friendly, visually appealing, and constantly evolving with interesting features. I love Stories, Reels and IGTV options for sharing content. Also, the explore page helps me discover new and interesting… _(v440.0.0.46.86, us, 2026-10-08)_
>
> ★★★★★ mera I'd bina koi reason ke saspend kar diya gya hai to please mera I'd recover kar do I'd name x4_Shakib_69 _(v450.0.0.50.77, us, 2026-10-08)_
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
    "ratingCount": 169625581,
    "version": null,
    "currentVersionReleaseDate": "2026-10-05T12:58:25.000Z",
    "installs": "5,000,000,000+",
    "url": "https://play.google.com/store/apps/details?id=com.instagram.android"
  },
  "store": "google",
  "sample": {
    "reviews": 300,
    "negativeReviews": 66,
    "positiveReviews": 223,
    "pagesFetched": 6,
    "byCountry": {
      "us": 300
    },
    "dateRange": {
      "from": "2026-10-08T04:31:32.000Z",
      "to": "2026-10-08T07:10:02.000Z"
    },
    "note": "Sample = most recent written reviews from Google Play in the requested language; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 53,
      "2": 13,
      "3": 11,
      "4": 21,
      "5": 202
    },
    "percent": {
      "1": 17.7,
      "2": 4.3,
      "3": 3.7,
      "4": 7,
      "5": 67.3
    },
    "average": 4.02,
    "total": 300
  },
  "storeRating": {
    "averageRating": 3.99,
    "ratingCount": 169625581
  },
  "ratingByVersion": [
    {
      "version": "451.0.0.0.64",
      "reviews": 1,
      "averageRating": 1,
      "negativeShare": 1,
      "firstSeen": "2026-10-08T05:13:08.000Z",
      "lastSeen": "2026-10-08T05:13:08.000Z"
    },
    {
      "version": "450.0.0.50.77",
      "reviews": 88,
      "averageRating": 3.73,
      "negativeShare": 0.295,
      "firstSeen": "2026-10-08T04:34:01.000Z",
      "lastSeen": "2026-10-08T07:10:02.000Z"
    },
    {
      "version": "449.0.0.52.84",
      "reviews": 37,
      "averageRating": 4.3,
      "negativeShare": 0.135,
      "firstSeen": "2026-10-08T04:34:27.000Z",
      "lastSeen": "2026-10-08T07:06:57.000Z"
    },
    {
      "version": "448.0.0.52.84",
      "reviews": 16,
      "averageRating": 4.31,
      "negativeShare": 0.125,
      "firstSeen": "2026-10-08T04:46:03.000Z",
      "lastSeen": "2026-10-08T07:04:01.000Z"
    },
    {
      "version": "447.0.0.55.81",
      "reviews": 8,
      "averageRating": 4.75,
      "negativeShare": 0,
      "firstSeen": "2026-10-08T04:35:02.000Z",
      "lastSeen": "2026-10-08T07:07:30.000Z"
    },
    {
      "version": "446.0.0.49.77",
      "reviews": 8,
      "averageRating": 4.5,
      "negativeShare": 0.125,
      "firstSeen": "2026-10-08T04:33:09.000Z",
      "lastSeen": "2026-10-08T06:09:02.000Z"
    },
    {
      "version": "445.0.0.45.83",
      "reviews": 4,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-08T05:27:52.000Z",
      "lastSeen": "2026-10-08T06:57:15.000Z"
    },
    {
      "version": "444.0.0.46.85",
      "reviews": 5,
      "averageRating": 3.2,
      "negativeShare": 0.4,
      "firstSeen": "2026-10-08T04:36:55.000Z",
      "lastSeen": "2026-10-08T06:53:43.000Z"
    },
    {
      "version": "443.0.0.48.82",
      "reviews": 5,
      "averageRating": 3.4,
      "negativeShare": 0.4,
      "firstSeen": "2026-10-08T04:34:56.000Z",
      "lastSeen": "2026-10-08T07:07:00.000Z"
    },
    {
      "version": "442.0.0.46.79",
      "reviews": 3,
      "averageRating": 3.67,
      "negativeShare": 0.333,
      "firstSeen": "2026-10-08T04:55:14.000Z",
      "lastSeen": "2026-10-08T07:01:34.000Z"
    },
    {
      "version": "441.0.0.43.81",
      "reviews": 2,
      "averageRating": 3.5,
      "negativeShare": 0.5,
      "firstSeen": "2026-10-08T05:28:49.000Z",
      "lastSeen": "2026-10-08T07:09:35.000Z"
    },
    {
      "version": "440.1.0.46.86",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-08T06:09:17.000Z",
      "lastSeen": "2026-10-08T06:09:17.000Z"
    },
    {
      "version": "440.0.0.46.86",
      "reviews": 1,
      "averageRating": 5,
      "negativeShare": 0,
      "firstSeen": "2026-10-08T05:32:06.000Z",
      "lastSeen": "2026-10-08T05:32:06.000Z"
    },
    {
      "version": 
… (truncated, 18002 more chars — see transcript.json)
```

</details>

### `compare_apps` 

Arguments: `{"app_ids":["284882215","389801252"],"country":"us","pages":2}` · 27 ms

| metric | 284882215 (apple) | 389801252 (apple) |
|---|---|---|
| name | Facebook | Instagram |
| developer | Meta Platforms, Inc. | Instagram, Inc. |
| store rating | 4.53 | 4.69 |
| store rating count | 28,709,088 | 29,583,259 |
| installs | – | – |
| current version | 582.0.0 | 450.1.0 |
| released | 2026-10-07 | 2026-10-06 |
| size (MB) | 489.7 | 594.3 |
| recent sample | 100 | 100 |
| recent avg | 3.02 | 2.07 |
| % negative (1–2★) | 44.0% | 72.0% |
| % positive (4–5★) | 46.0% | 25.0% |
| latest version avg | 3.02 (582.0.0, n=100) | 2.07 (450.1.0, n=100) |
| top complaints | ads, friends, post, account, feed | reels, ipad, video, screen, account |

**Leaders:** storeAverageRating: Instagram (4.69) · storeRatingCount: Instagram (29583259) · recentAverageRating: Facebook (3.02) · lowestRecentNegativeShare: Facebook (0.44) · latestVersionAverageRating: Facebook (3.02)

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
      "storeRatingCount": 28709088,
      "currentVersion": "582.0.0",
      "currentVersionReleaseDate": "2026-10-07T14:52:01Z",
      "sizeMB": 489.7,
      "recentReviewSample": 100,
      "recentAverageRating": 3.02,
      "recentNegativeShare": 0.44,
      "recentPositiveShare": 0.46,
      "latestVersion": "582.0.0",
      "latestVersionAverageRating": 3.02,
      "latestVersionReviewCount": 100,
      "ratingDistribution": {
        "1": 39,
        "2": 5,
        "3": 10,
        "4": 7,
        "5": 39
      },
      "reviewDateRange": {
        "from": "2026-10-09T21:01:28-07:00",
        "to": "2026-10-10T09:26:21-07:00"
      },
      "topComplaints": [
        {
          "phrase": "ads",
          "reviews": 10,
          "share": 0.227
        },
        {
          "phrase": "friends",
          "reviews": 7,
          "share": 0.159
        },
        {
          "phrase": "post",
          "reviews": 6,
          "share": 0.136
        },
        {
          "phrase": "account",
          "reviews": 5,
          "share": 0.114
        },
        {
          "phrase": "feed",
          "reviews": 5,
          "share": 0.114
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
      "storeRatingCount": 29583259,
      "currentVersion": "450.1.0",
      "currentVersionReleaseDate": "2026-10-06T12:29:07Z",
      "sizeMB": 594.3,
      "recentReviewSample": 100,
      "recentAverageRating": 2.07,
      "recentNegativeShare": 0.72,
      "recentPositiveShare": 0.25,
      "latestVersion": "450.1.0",
      "latestVersionAverageRating": 2.07,
      "latestVersionReviewCount": 100,
      "ratingDistribution": {
        "1": 68,
        "2": 4,
        "3": 3,
        "4": 3,
        "5": 22
      },
      "reviewDateRange": {
        "from": "2026-10-09T16:48:51-07:00",
        "to": "2026-10-10T09:26:18-07:00"
      },
      "topComplaints": [
        {
          "phrase": "reels",
          "reviews": 25,
          "share": 0.347
        },
        {
          "phrase": "ipad",
          "reviews": 20,
          "share": 0.278
        },
        {
          "phrase": "video",
          "reviews": 15,
          "share": 0.208
        },
        {
          "phrase": "screen",
          "reviews": 14,
          "share": 0.194
        },
        {
          "phrase": "account",
          "reviews": 8,
          "share": 0.111
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
      "value": 29583259
    },
    "recentAverageRating": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 3.02
    },
    "lowestRecentNegativeShare": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 0.44
    },
    "latestVersionAverageRating": {
      "id": "284882215",
      "store": "apple",
      "name": "Facebook",
      "value": 3.02
    }
  }
}
```

</details>

### `compare_apps` 

Arguments: `{"app_ids":["324684580","com.spotify.music"],"pages":1}` · 510 ms

| metric | 324684580 (apple) | com.spotify.music (google) |
|---|---|---|
| name | Spotify: Music and Podcasts | Spotify: Music and Podcasts |
| developer | Spotify | Spotify AB |
| store rating | 4.77 | 4.35 |
| store rating count | 42,514,293 | 36,464,797 |
| installs | – | 1,000,000,000+ |
| current version | 9.1.90 | – |
| released | 2026-10-08 | 2026-10-07 |
| size (MB) | 293.8 | – |
| recent sample | 50 | 50 |
| recent avg | 4.18 | 3.86 |
| % negative (1–2★) | 16.0% | 28.0% |
| % positive (4–5★) | 78.0% | 70.0% |
| latest version avg | 4.18 (9.1.90, n=50) | 3.77 (9.1.90.2270, n=26) |
| top complaints | ads, expensive, premium | song, premium, ad, play, subscription |

**Leaders:** storeAverageRating: Spotify: Music and Podcasts (4.77) · storeRatingCount: Spotify: Music and Podcasts (42514293) · recentAverageRating: Spotify: Music and Podcasts (4.18) · lowestRecentNegativeShare: Spotify: Music and Podcasts (0.16) · latestVersionAverageRating: Spotify: Music and Podcasts (4.18)

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
      "storeRatingCount": 42514293,
      "currentVersion": "9.1.90",
      "currentVersionReleaseDate": "2026-10-08T07:37:17Z",
      "sizeMB": 293.8,
      "recentReviewSample": 50,
      "recentAverageRating": 4.18,
      "recentNegativeShare": 0.16,
      "recentPositiveShare": 0.78,
      "latestVersion": "9.1.90",
      "latestVersionAverageRating": 4.18,
      "latestVersionReviewCount": 50,
      "ratingDistribution": {
        "1": 6,
        "2": 2,
        "3": 3,
        "4": 5,
        "5": 34
      },
      "reviewDateRange": {
        "from": "2026-10-10T06:35:50-07:00",
        "to": "2026-10-10T09:25:15-07:00"
      },
      "topComplaints": [
        {
          "phrase": "ads",
          "reviews": 2,
          "share": 0.25
        },
        {
          "phrase": "expensive",
          "reviews": 2,
          "share": 0.25
        },
        {
          "phrase": "premium",
          "reviews": 2,
          "share": 0.25
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
      "storeRatingCount": 36464797,
      "installs": "1,000,000,000+",
      "currentVersion": null,
      "currentVersionReleaseDate": "2026-10-07T06:27:03.000Z",
      "sizeMB": null,
      "recentReviewSample": 50,
      "recentAverageRating": 3.86,
      "recentNegativeShare": 0.28,
      "recentPositiveShare": 0.7,
      "latestVersion": "9.1.90.2270",
      "latestVersionAverageRating": 3.77,
      "latestVersionReviewCount": 26,
      "ratingDistribution": {
        "1": 9,
        "2": 5,
        "3": 1,
        "4": 4,
        "5": 31
      },
      "reviewDateRange": {
        "from": "2026-10-10T19:34:02.000Z",
        "to": "2026-10-10T22:08:27.000Z"
      },
      "topComplaints": [
        {
          "phrase": "song",
          "reviews": 6,
          "share": 0.429
        },
        {
          "phrase": "premium",
          "reviews": 6,
          "share": 0.429
        },
        {
          "phrase": "ad",
          "reviews": 5,
          "share": 0.357
        },
        {
          "phrase": "play",
          "reviews": 4,
          "share": 0.286
        },
        {
          "phrase": "subscription",
          "reviews": 3,
          "share": 0.214
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
      "value": 42514293
    },
    "recentAverageRating": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 4.18
    },
    "lowestRecentNegativeShare": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 0.16
    },
    "latestVersionAverageRating": {
      "id": "324684580",
      "store": "apple",
      "name": "Spotify: Music and Podcasts",
      "value": 4.18
    }
  }
}
```

</details>

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"not-an-id"}` · 1 ms

> Error (invalid_input): Invalid app_id "not-an-id". Use the numeric App Store id (e.g. 284882215) or an apps.apple.com URL.

### `get_app_reviews` ⚠️ (error)

Arguments: `{"app_id":"284882215","pages":11}` · 1 ms

> MCP error -32602: Input validation error: Invalid arguments for tool get_app_reviews: Too big: expected number to be <=10 at pages

### `search_apps` ⚠️ (error)

Arguments: `{"term":"x","country":"usa"}` · 1 ms

> MCP error -32602: Input validation error: Invalid arguments for tool search_apps: must be a 2-letter ISO country code at country

### `compare_apps` ⚠️ (error)

Arguments: `{"app_ids":["284882215"]}` · 2 ms

> MCP error -32602: Input validation error: Invalid arguments for tool compare_apps: Too small: expected array to have >=2 items at app_ids

### `get_app_reviews` 

Arguments: `{"app_id":"999999999999"}` · 71 ms

App **999999999999** (apple) · us · sort=mostrecent · pages fetched 0/1 · **0 reviews**

_No reviews returned. The app may not exist in this storefront or has no written reviews._


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
  "note": "No reviews returned. The app may not exist in this storefront or has no written reviews.",
  "reviews": []
}
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"com.example.does.not.exist.zz"}` · 103 ms

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

Arguments: `{"app_id":"com.spotify.music","store":"apple"}` · 2 ms

> Error (invalid_input): "com.spotify.music" looks like a Google Play package name; use store "google" (or omit store).

### `review_insights` ⚠️ (error)

Arguments: `{"app_id":"284882215","store":"google"}` · 2 ms

> Error (invalid_input): Invalid Google Play app id "284882215". Use the package name (e.g. com.instagram.android) or a play.google.com/store/apps/details?id=… URL.

## Streamable HTTP mode

```json
{
  "url": "http://127.0.0.1:40771/mcp",
  "health": {
    "status": "ok",
    "name": "app-review-intel-mcp",
    "version": "1.1.0",
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
- ✅ server version 1.1.0
- ✅ descriptions stay concise (< 700 chars) — 416,412,585,513
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
- ✅ review_insights Facebook keywords exclude stopwords/filler — ads, post, friends, videos, reels, ai, account, content, page, feed, marketplace, stop, experience, feel, comments
- ✅ review_insights Facebook keywords exclude app name
- ✅ review_insights Facebook has sample quotes
- ✅ review_insights Facebook has versionDeltas — Version 582.0.0 (203 reviews) average 3.10★ vs 2.57★ for previous version 581.0.0 (97 reviews), +0.53; negative share 43.8% vs 59.8% (−16 pp). Rising complaints: "ads" (+10.4 pp, 22.5% of negative reviews), "feed" (+7.3 pp, 9% of negative reviews), "watch" (new, 5.6% of negative reviews).
- ✅ review_insights Facebook versionDeltas explains or compares
- ✅ review_insights Instagram ok
- ✅ review_insights Instagram distribution sums to sample
- ✅ review_insights Instagram covers both countries — {"us":150,"gb":150}
- ✅ review_insights Instagram has version breakdown
- ✅ review_insights Instagram has complaint keywords
- ✅ review_insights Instagram keywords exclude stopwords/filler — reels, ipad, account, screen, video, posts, full screen, reason, ai, window, content, small, square, platform, change
- ✅ review_insights Instagram keywords exclude app name
- ✅ review_insights Instagram has sample quotes
- ✅ review_insights Instagram has versionDeltas — Version 450.1.0 (210 reviews) average 2.17★ vs 3.00★ for previous versions 448.0.0–450.0.0 (90 reviews), −0.83; negative share 69.5% vs 46.7% (+22.8 pp). Rising complaints: "ipad" (new, 24% of negative reviews), "reels" (+18.6 pp, 28.1% of negative reviews), "screen" (+17.5 pp, 19.9% of negative reviews).
- ✅ review_insights Instagram versionDeltas explains or compares
- ✅ review_insights google ok
- ✅ review_insights google has app metadata
- ✅ review_insights google sample size — n=300
- ✅ review_insights google complaint keywords — account, suspended, suspend, disabled, reason, issue, years, users, meta, post, request, action, problem, ai, community guidelines
- ✅ review_insights google versionDeltas by version — Version 450.0.0.50.77 and newer (89 reviews) average 3.70★ vs 4.30★ for previous version 449.0.0.52.84 (37 reviews), −0.60; negative share 30.3% vs 13.5% (+16.8 pp). Rising complaints: "post" (new, 14.8% of negative reviews), "request" (new, 11.1% of negative reviews), "suspended" (new, 11.1% of negative reviews). Low confidence: few negative reviews in one of the periods.
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
