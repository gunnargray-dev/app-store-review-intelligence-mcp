# app-review-intel-mcp — smoke test transcript

Generated 2026-10-11T19:52:19.341Z by `test/smoke.mjs` against live Apple endpoints. Server: **app-review-intel-mcp 1.0.0** over stdio.

**Assertions: 42/42 passed.**

## Tools

- **`search_apps`** — Search the Apple App Store for apps by keyword. Returns app ids, names, developers, ratings, rating counts, price, current version and store URL. Use the returned id with the review tools.
  - params: `term`* (string), `country` (string), `limit` (integer)
- **`get_app_reviews`** — Fetch customer reviews for an App Store app from Apple's public review feed. Returns normalized reviews (id, author, rating, title, body, version, date). Each page holds up to 50 reviews; Apple serves at most 10 pages.
  - params: `app_id`* (integer|string), `country` (string), `pages` (integer), `sort` (string)
- **`review_insights`** — Aggregate recent reviews of an app across one or more storefronts: rating distribution, average rating by app version (newest first), top complaint keywords/phrases from 1-2 star reviews (stopword-filtered 1-3 word n-grams ranked by how many reviews mention them), and representative negative/positive quotes.
  - params: `app_id`* (integer|string), `countries` (array), `pages` (integer), `keyword_limit` (integer), `quotes` (integer)
- **`compare_apps`** — Side-by-side comparison of 2-10 App Store apps in one storefront: store rating & rating count, price, size, current version & release date, plus metrics from recent reviews (sample average, % negative/positive, latest-version average, top complaint keywords). Includes per-metric leaders.
  - params: `app_ids`* (array), `country` (string), `pages` (integer)

## Calls

### `search_apps` 

Arguments: `{"term":"instagram","country":"us","limit":5}` · 375 ms

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
      "genre": "Social Networking",
      "price
… (truncated, 2269 more chars — see transcript.json)
```

</details>

### `search_apps` 

Arguments: `{"term":"facebook","limit":3}` · 226 ms

| id | name | developer | rating | ratings | version |
|---|---|---|---|---|---|
| 284882215 | Facebook | Meta Platforms, Inc. | 4.53 | 28,709,088 | 582.0.0 |
| 454638411 | Messenger | Meta Platforms, Inc. | 4.66 | 13,766,613 | 582.0.0 |
| 389801252 | Instagram | Instagram, Inc. | 4.69 | 29,583,259 | 450.1.0 |

<details><summary>Raw response</summary>

```json
{
  "term": "facebook",
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

### `get_app_reviews` 

Arguments: `{"app_id":"284882215","country":"us","pages":2,"sort":"mostrecent"}` · 102 ms

App **284882215** · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

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
      "author": "MLninenine",
      "rating
… (truncated, 33274 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"389801252","country":"us","pages":2,"sort":"mostrecent"}` · 100 ms

App **389801252** · us · sort=mostrecent · pages fetched 2/2 · **100 reviews**

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
      "title": "Trash",
      "body
… (truncated, 37213 more chars — see transcript.json)
```

</details>

### `get_app_reviews` 

Arguments: `{"app_id":"https://apps.apple.com/us/app/instagram/id389801252","sort":"mosthelpful"}` · 199 ms

App **389801252** · us · sort=mosthelpful · pages fetched 1/1 · **50 reviews**

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
      "body": "Instagram is a really good app and I love it but I had a problem recently… Someone made an account pretending to be me they used one my pictures from my page and used my name and middle n
… (truncated, 84788 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"284882215","countries":["us","gb"],"pages":3}` · 103 ms

**Facebook** (284882215) — sample of 200 recent reviews {"us":150,"gb":50}, 2026-10-07 → 2026-10-10

Store rating: **4.53** over 28,697,057 ratings · Sample average: **3.08**

| ★ | count | % |
|---|---|---|
| 5 | 84 | 42% |
| 4 | 10 | 5% |
| 3 | 17 | 8.5% |
| 2 | 15 | 7.5% |
| 1 | 74 | 37% |

**Average rating by version (newest first)**

| version | reviews | avg | % negative |
|---|---|---|---|
| 582.0.0 | 200 | 3.08 | 44.5% |

**Top complaint keywords (1–2★, n=89)**

| phrase | reviews | tf | example |
|---|---|---|---|
| ads | 17 | 30 | Trash. Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything bu |
| friends | 12 | 16 | …that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they ca |
| post | 9 | 13 | Why is there no option when making a post on your phone to tag a person???. Bbb |
| posts | 9 | 10 | …joined Facebook in 2008 or 2009. I had many many memories through posts and pictures over the years. Facebook deleted my account in Oct 2020 just a couple of weeks before the election because I posted |
| account | 8 | 15 | …ey on words which they often misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded. |
| reels | 8 | 13 | …I don’t want to have to search for my normal feed. Why start with reels of people I don’t know or care about. The constant ads are bad enough this may be the thing that makes me delete this app. |
| content | 7 | 9 | TrashBook. Fraud Employees that are ruining good content for their own selfish gain |
| ad | 7 | 8 | Most volatile ad and algorithm out there. Trash, absolute trash |
| ai | 7 | 8 | Grumpy old man. AI slop |
| find | 7 | 8 | …ends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they care enough to change it either. So disappointing. |
| comments | 6 | 11 | …ted them and Facebook said they didn’t see a reason to take their comments down! Also i’ve had harassing comments from Muslims and Facebook said they didn’t find any wrongdoings and will not take thei |
| video | 6 | 9 | They’ve lost the plot. I have had 5 ads in the span of a 4 min video. Other platforms have learned to either be user friendly and not interfere with every 30 seconds of a video or create a subscriptio |
| feed | 6 | 6 | …seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they care enough to change it either. So disappointing. |
| videos | 6 | 6 | Propaganda. Es muy aburrido ver los videos porque siempre son interrumpidos por publicidad!!! Y video tras video lo mismo. |
| never | 5 | 8 | …was a Russian Hoax. Turns out it was absolutely true and Facebook never offered an apology and never gave me my account back OR MY CONTENT. Facebook didn’t want the truth out and is controlled by the |

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
    "ratingCount": 28697057,
    "version": "582.0.0",
    "currentVersionReleaseDate": "2026-10-07T14:52:01Z",
    "url": "https://apps.apple.com/us/app/facebook/id284882215"
  },
  "sample": {
    "reviews": 200,
    "negativeReviews": 89,
    "positiveReviews": 94,
    "pagesFetched": 4,
    "byCountry": {
      "us": 150,
      "gb": 50
    },
    "dateRange": {
      "from": "2026-10-07T09:31:02-07:00",
      "to": "2026-10-10T09:26:21-07:00"
    },
    "note": "Sample = most recent written reviews from Apple's RSS feed; it is not the full store rating population."
  },
  "ratingDistribution": {
    "counts": {
      "1": 74,
      "2": 15,
      "3": 17,
      "4": 10,
      "5": 84
    },
    "percent": {
      "1": 37,
      "2": 7.5,
      "3": 8.5,
      "4": 5,
      "5": 42
    },
    "average": 3.08,
    "total": 200
  },
  "storeRating": {
    "averageRating": 4.53,
    "ratingCount": 28697057
  },
  "ratingByVersion": [
    {
      "version": "582.0.0",
      "reviews": 200,
      "averageRating": 3.08,
      "negativeShare": 0.445,
      "firstSeen": "2026-10-07T09:31:02-07:00",
      "lastSeen": "2026-10-10T09:26:21-07:00"
    }
  ],
  "complaintKeywords": [
    {
      "phrase": "ads",
      "n": 1,
      "reviews": 17,
      "tf": 30,
      "example": "Trash. Yet another app that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything bu"
    },
    {
      "phrase": "friends",
      "n": 1,
      "reviews": 12,
      "tf": 16,
      "example": "…that has gone to trash. Hundreds of ads instead of seeing what my friends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they ca"
    },
    {
      "phrase": "post",
      "n": 1,
      "reviews": 9,
      "tf": 13,
      "example": "Why is there no option when making a post on your phone to tag a person???. Bbb"
    },
    {
      "phrase": "posts",
      "n": 1,
      "reviews": 9,
      "tf": 10,
      "example": "…joined Facebook in 2008 or 2009. I had many many memories through posts and pictures over the years. Facebook deleted my account in Oct 2020 just a couple of weeks before the election because I posted"
    },
    {
      "phrase": "account",
      "n": 1,
      "reviews": 8,
      "tf": 15,
      "example": "…ey on words which they often misinterpret, leading to unwarranted account restrictions, based on the rules cited. When a user appeals the ruling, the decision is rarely rescinded."
    },
    {
      "phrase": "reels",
      "n": 1,
      "reviews": 8,
      "tf": 13,
      "example": "…I don’t want to have to search for my normal feed. Why start with reels of people I don’t know or care about. The constant ads are bad enough this may be the thing that makes me delete this app."
    },
    {
      "phrase": "content",
      "n": 1,
      "reviews": 7,
      "tf": 9,
      "example": "TrashBook. Fraud Employees that are ruining good content for their own selfish gain"
    },
    {
      "phrase": "ad",
      "n": 1,
      "reviews": 7,
      "tf": 8,
      "example": "Most volatile ad and algorithm out there. Trash, absolute trash"
    },
    {
      "phrase": "ai",
      "n": 1,
      "reviews": 7,
      "tf": 8,
      "example": "Grumpy old man. AI slop"
    },
    {
      "phrase": "find",
      "n": 1,
      "reviews": 7,
      "tf": 8,
      "example": "…ends post. I went down and down and down on my feed and could not find one post from a friend or anything but ads. Not like they care enough to change it either. So disappointing."
    },
    {
      "phrase": "comments",
      "n": 1,
      "reviews": 6,
      "tf": 11,
      "example": "…ted them and Facebook said they didn’t see a reason to take th
… (truncated, 3958 more chars — see transcript.json)
```

</details>

### `review_insights` 

Arguments: `{"app_id":"389801252","countries":["us","gb"],"pages":3}` · 205 ms

**Instagram** (389801252) — sample of 300 recent reviews {"us":150,"gb":150}, 2026-09-26 → 2026-10-10

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

**Top complaint keywords (1–2★, n=188)**

| phrase | reviews | tf | example |
|---|---|---|---|
| reels | 37 | 55 | Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡 |
| ipad | 35 | 49 | Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡 |
| screen | 30 | 43 | Trash. the Reels user interface is broken and unwatchable due to UI clutter all over the screen |
| account | 24 | 37 | BLOCKED ACCOUNT. I don’t understand what happened to my Instagram account (@lshamkina). There is no explanation given when I try to log in. The account doesn't show up in search results. I am the offi |
| video | 18 | 24 | …on is ruining Reels. It sits right where you double-tap to like a video, so I keep accidentally tapping it and opening shopping pages instead of liking. Please move it away from the like zone, remove |
| reason | 17 | 21 | Baaasdddddddd. So Baddd It bans accounts randomly and without reason. |
| videos | 17 | 18 | Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡 |
| posts | 16 | 28 | …ple boxes 3) those boxes are cutting off the tops of the reels or posts. So in some cases peoples heads are chopped off. Fix this issue please so viewers do not stop using app. |
| full screen | 16 | 19 | Broken UI in latest update. Can no longer see full screen reels in iPad. They now crop reels to square format in a floating window. Idiotic |
| ai | 14 | 20 | Stop putting more buttons on the screen. Seriously stop with this unremovable "shop now" button. God this app is insufferable between that and constant AI ads |
| accounts | 14 | 19 | …orst app !!!!. Absolutely terrible experience! Instagram suspends accounts without proper explanations and provides zero helpful customer support. Even after submitting an appeal and verifying my iden |
| content | 13 | 20 | …nce. Adding this feature would make it much easier to enjoy video content on the platform. |
| reel | 13 | 17 | …ething has changed in the last week. I used to be able to touch a reel, bring it up in a second screen then rewatch, rewind, or fast forward. Now I touch the reel or try to rewatch, a black screen com |
| window | 13 | 16 | Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡 |
| small | 13 | 16 | Fix search for iPad. Search in the iPad app has become unusable. Reels a placed in a small window that cuts off the top and bottom and some don’t even load. |

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
  "complaintKeywords": [
    {
      "phrase": "reels",
      "n": 1,
      "reviews": 37,
      "tf": 55,
      "example": "Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡"
    },
    {
      "phrase": "ipad",
      "n": 1,
      "reviews": 35,
      "tf": 49,
      "example": "Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡"
    },
    {
      "phrase": "screen",
      "n": 1,
      "reviews": 30,
      "tf": 43,
      "example": "Trash. the Reels user interface is broken and unwatchable due to UI clutter all over the screen"
    },
    {
      "phrase": "account",
      "n": 1,
      "reviews": 24,
      "tf": 37,
      "example": "BLOCKED ACCOUNT. I don’t understand what happened to my Instagram account (@lshamkina). There is no explanation given when I try to log in. The account doesn't show up in search results. I am the offi"
    },
    {
      "phrase": "video",
      "n": 1,
      "reviews": 18,
      "tf": 24,
      "example": "…on is ruining Reels. It sits right where you double-tap to like a video, so I keep accidentally tapping it and opening shopping pages instead of liking. Please move it away from the like zone, remove"
    },
    {
      "phrase": "reason",
      "n": 1,
      "reviews": 17,
      "tf": 21,
      "example": "Baaasdddddddd. So Baddd It bans accounts randomly and without reason."
    },
    {
      "phrase": "videos",
      "n": 1,
      "reviews": 17,
      "tf": 18,
      "example": "Fix Reels!!! Tiny window. New update puts videos in a tiny window on iPad. Horrible update. Makes app unusable on iPad. Fix it back to the way it was!!!🤬🥵😡🤬🥵😡"
    },
    {
      "phrase": "posts",
      "n": 1,
      "reviews": 16,
      "tf": 28,
      "example": "…ple boxes 3) those boxes are cutting off the tops of the reels or posts. So in som
… (truncated, 4278 more chars — see transcript.json)
```

</details>

### `compare_apps` 

Arguments: `{"app_ids":["284882215","389801252"],"country":"us","pages":2}` · 126 ms

| metric | 284882215 | 389801252 |
|---|---|---|
| name | Facebook | Instagram |
| developer | Meta Platforms, Inc. | Instagram, Inc. |
| store rating | 4.53 | 4.69 |
| store rating count | 28,709,088 | 29,583,259 |
| current version | 582.0.0 | 450.1.0 |
| released | 2026-10-07 | 2026-10-06 |
| size (MB) | 489.7 | 594.3 |
| recent sample | 100 | 100 |
| recent avg | 3.02 | 2.07 |
| % negative (1–2★) | 44.0% | 72.0% |
| % positive (4–5★) | 46.0% | 25.0% |
| latest version avg | 3.02 (n=100) | 2.07 (n=100) |
| top complaints | ads, friends, post, account, content | reels, ipad, screen, video, videos |

**Leaders:** storeAverageRating: Instagram (4.69) · storeRatingCount: Instagram (29583259) · recentAverageRating: Facebook (3.02) · lowestRecentNegativeShare: Facebook (0.44) · latestVersionAverageRating: Facebook (3.02)

<details><summary>Raw response</summary>

```json
{
  "country": "us",
  "apps": [
    {
      "id": "284882215",
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
          "reviews": 8
        },
        {
          "phrase": "friends",
          "reviews": 6
        },
        {
          "phrase": "post",
          "reviews": 4
        },
        {
          "phrase": "account",
          "reviews": 4
        },
        {
          "phrase": "content",
          "reviews": 4
        }
      ]
    },
    {
      "id": "389801252",
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
          "reviews": 21
        },
        {
          "phrase": "ipad",
          "reviews": 20
        },
        {
          "phrase": "screen",
          "reviews": 14
        },
        {
          "phrase": "video",
          "reviews": 11
        },
        {
          "phrase": "videos",
          "reviews": 8
        }
      ]
    }
  ],
  "leaders": {
    "storeAverageRating": {
      "id": "389801252",
      "name": "Instagram",
      "value": 4.69
    },
    "storeRatingCount": {
      "id": "389801252",
      "name": "Instagram",
      "value": 29583259
    },
    "recentAverageRating": {
      "id": "284882215",
      "name": "Facebook",
      "value": 3.02
    },
    "lowestRecentNegativeShare": {
      "id": "284882215",
      "name": "Facebook",
      "value": 0.44
    },
    "latestVersionAverageRating": {
      "id": "284882215",
      "name": "Facebook",
      "value": 3.02
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

Arguments: `{"app_ids":["284882215"]}` · 2 ms

> MCP error -32602: Input validation error: Invalid arguments for tool compare_apps: Too small: expected array to have >=2 items at app_ids

### `get_app_reviews` 

Arguments: `{"app_id":"999999999999"}` · 96 ms

App **999999999999** · us · sort=mostrecent · pages fetched 0/1 · **0 reviews**

_No reviews returned. The app may not exist in this storefront or has no written reviews._


<details><summary>Raw response</summary>

```json
{
  "appId": "999999999999",
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

## Streamable HTTP mode

```json
{
  "url": "http://127.0.0.1:33289/mcp",
  "health": {
    "status": "ok",
    "name": "app-review-intel-mcp",
    "version": "1.0.0",
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

- ✅ lists 4 tools — compare_apps,get_app_reviews,review_insights,search_apps
- ✅ every tool has an input schema & description
- ✅ search_apps ok
- ✅ search_apps returns results — count=5
- ✅ search_apps finds Instagram (389801252)
- ✅ search_apps defaults country=us
- ✅ search_apps finds Facebook (284882215)
- ✅ get_app_reviews Facebook ok
- ✅ get_app_reviews Facebook returns reviews — count=100
- ✅ get_app_reviews Facebook normalized shape
- ✅ get_app_reviews Facebook no duplicate ids
- ✅ get_app_reviews Instagram ok
- ✅ get_app_reviews Instagram returns reviews — count=100
- ✅ get_app_reviews Instagram normalized shape
- ✅ get_app_reviews Instagram no duplicate ids
- ✅ get_app_reviews accepts App Store URL + mosthelpful
- ✅ review_insights Facebook ok
- ✅ review_insights Facebook distribution sums to sample
- ✅ review_insights Facebook covers both countries — {"us":150,"gb":50}
- ✅ review_insights Facebook has version breakdown
- ✅ review_insights Facebook has complaint keywords
- ✅ review_insights Facebook keywords exclude stopwords
- ✅ review_insights Facebook has sample quotes
- ✅ review_insights Instagram ok
- ✅ review_insights Instagram distribution sums to sample
- ✅ review_insights Instagram covers both countries — {"us":150,"gb":150}
- ✅ review_insights Instagram has version breakdown
- ✅ review_insights Instagram has complaint keywords
- ✅ review_insights Instagram keywords exclude stopwords
- ✅ review_insights Instagram has sample quotes
- ✅ compare_apps ok
- ✅ compare_apps returns both apps
- ✅ compare_apps has metrics
- ✅ compare_apps names leaders
- ✅ invalid app_id → isError
- ✅ pages > 10 rejected by schema
- ✅ invalid country rejected
- ✅ compare_apps with 1 id rejected
- ✅ unknown app → graceful empty result
- ✅ HTTP mode: health endpoint
- ✅ HTTP mode: lists 4 tools
- ✅ HTTP mode: tool call works
