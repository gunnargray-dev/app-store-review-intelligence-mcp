#!/usr/bin/env node
/**
 * End-to-end smoke test.
 *  - Spawns the built server (dist/index.js) over stdio with the MCP SDK Client
 *  - Offline unit checks of the complaint extraction / version-delta logic
 *  - Lists tools and calls every tool against real apps:
 *      Apple: 284882215 (Facebook), 389801252 (Instagram)
 *      Google Play: com.instagram.android, com.spotify.music
 *  - Exercises input-validation / error paths
 *  - Offline checks of GOOGLE_PLAY_ENABLED=false (hosted mode): schemas App Store only, Google ids rejected
 *  - Briefly checks Streamable HTTP mode (--http)
 *  - Writes demo/transcript.json and demo/transcript.md
 * Exits non-zero on any failed assertion.
 */
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const SERVER = join(ROOT, "dist", "index.js");
const DEMO = join(ROOT, "demo");
const FACEBOOK = "284882215";
const INSTAGRAM = "389801252";
const PLAY_INSTAGRAM = "com.instagram.android";
const PLAY_SPOTIFY = "com.spotify.music";
// Words that must never surface as complaint keywords.
const FILLER = ["the", "app", "apps", "and", "is", "never", "find", "even", "still", "just", "get", "got", "cant", "can't", "dont", "don't", "im", "i'm", "ive", "really", "please", "also", "like", "would", "could", "every", "time", "keep", "make", "one", "use", "using", "used", "now", "back", "thing", "things", "way"];

const transcript = {
  generatedAt: new Date().toISOString(),
  server: null,
  tools: [],
  calls: [],
  http: null,
  assertions: [],
};
let failures = 0;

function check(name, cond, detail = "") {
  transcript.assertions.push({ name, passed: !!cond, ...(detail ? { detail } : {}) });
  console.log(`${cond ? "  ✔" : "  ✘"} ${name}${detail && !cond ? ` — ${detail}` : ""}`);
  if (!cond) failures++;
}

async function call(client, name, args, { expectError = false } = {}) {
  const started = Date.now();
  let result;
  try {
    result = await client.callTool({ name, arguments: args }, undefined, { timeout: 180_000 });
  } catch (err) {
    // Protocol-level errors (e.g. unknown tool) surface as exceptions.
    result = { isError: true, content: [{ type: "text", text: String(err?.message ?? err) }], protocolError: true };
  }
  const ms = Date.now() - started;
  const data = result.structuredContent ?? (() => {
    try { return JSON.parse(result.content?.[0]?.text ?? ""); } catch { return null; }
  })();
  transcript.calls.push({ tool: name, arguments: args, durationMs: ms, isError: !!result.isError, result });
  console.log(`→ ${name} ${JSON.stringify(args)} (${ms} ms)${result.isError ? " [error]" : ""}`);
  if (!expectError && result.isError) console.log("    ", result.content?.[0]?.text);
  return { result, data };
}

// --- Offline unit checks (no network) ---------------------------------------
async function runUnit() {
  const { topKeywords, versionDeltas, stem, tokenize } = await import(join(ROOT, "dist", "insights.js"));
  let n = 0;
  const rv = (body, { rating = 1, version = "2.0.0", date = "2026-10-10T12:00:00Z", author } = {}) => ({
    id: `u${++n}`, author: author ?? `user${n}`, rating, title: "", body, version, date, voteSum: 0, voteCount: 0, country: "us",
  });

  check("unit: curly apostrophes normalized", JSON.stringify(tokenize("Don’t can‘t")) === JSON.stringify(["don't", "can't"]));
  check("unit: plural stemming", stem("accounts") === "account" && stem("stories") === "story" && stem("crashes") === "crash" && stem("videos") === "video" && stem("ios") === "ios" && stem("status") === "status");

  const filler = [
    "I just can’t even get it to work, I never find anything and I’m really done with this app, please fix",
    "Don't use it, every time I use it I keep getting nothing back. Things are just the way they are, would not recommend",
    "Dont bother, I've used it now and could not find one thing. Still broken also",
  ].map((b) => rv(b));
  const kwFiller = topKeywords(filler, { minReviews: 2 }).map((k) => k.phrase);
  check("unit: filler words filtered", !kwFiller.some((p) => p.split(" ").some((w) => FILLER.includes(w))), kwFiller.join(", "));

  const merged = topKeywords(
    [
      rv("My account got banned"), rv("Accounts keep getting hacked"), rv("Lost my account again"),
      rv("Reels are no longer full screen"), rv("Full screen reels gone"), rv("Bring back full screen"), rv("full screen please"),
      rv("Small screen on the login page"),
    ],
    { minReviews: 2, extraStopwords: ["Instagram"] },
  );
  const phrases = merged.map((k) => k.phrase);
  check("unit: plural/singular merged (account/accounts)", phrases.filter((p) => /^accounts?$/.test(p)).length === 1 && merged.find((k) => /^accounts?$/.test(k.phrase))?.reviews === 3, phrases.join(", "));
  check("unit: bigram suppresses redundant unigram (full screen ⊃ screen)", phrases.includes("full screen") && !phrases.includes("screen") && !phrases.includes("full"), phrases.join(", "));
  check("unit: keywords carry share", merged.every((k) => typeof k.share === "number" && k.share > 0 && k.share <= 1));
  check("unit: app name tokens excluded", !topKeywords([rv("Instagram reels broken"), rv("instagram's reels broken")], { extraStopwords: ["Instagram"] }).some((k) => /instagram/.test(k.phrase)));

  // Two versions: latest introduces a "login loop" complaint and lower ratings.
  const two = [
    ...Array.from({ length: 12 }, (_, i) => rv(i < 8 ? "Stuck in a login loop since the update" : "Feed is slow", { version: "2.0.0", rating: i < 10 ? 1 : 4 })),
    ...Array.from({ length: 12 }, (_, i) => rv(i < 4 ? "Feed is slow and laggy" : "Works fine, love it", { version: "1.9.0", rating: i < 4 ? 2 : 5 })),
  ];
  const d2 = versionDeltas(two);
  check("unit: versionDeltas compares latest vs previous version", d2.basis === "version" && d2.latest.label === "2.0.0" && d2.previous.versions[0] === "1.9.0", JSON.stringify(d2.latest?.label));
  check("unit: versionDeltas rating & negative-share change", d2.change.averageRating < 0 && d2.change.negativeShare > 0, JSON.stringify(d2.change));
  const login = d2.whatGotWorse.find((w) => /login loop/.test(w.phrase));
  check("unit: whatGotWorse finds new complaint with quote", login?.status === "new" && login.examples?.length > 0 && /login loop/i.test(login.examples[0].text), JSON.stringify(d2.whatGotWorse.map((w) => w.phrase)));
  check("unit: summary mentions change", /login loop/.test(d2.summary) && /pp/.test(d2.summary), d2.summary);

  // One version, spread over 10 days → time fallback.
  const day = (k) => new Date(Date.UTC(2026, 9, 10) - k * 86_400_000).toISOString();
  const one = Array.from({ length: 30 }, (_, i) => rv(i < 10 ? "Battery drain is awful" : "Nice and smooth", { version: "5.0", rating: i < 10 ? 1 : 5, date: day(i < 10 ? i % 2 : 4 + (i % 6)) }));
  const d1 = versionDeltas(one);
  check("unit: single version → time fallback", d1.basis === "time" && d1.notes.some((t) => /Only one app version/.test(t)) && d1.latest.label === "last 3 days", JSON.stringify(d1.notes));

  // One version, all within an hour → explained, no comparison.
  const flat = Array.from({ length: 20 }, () => rv("Battery drain", { version: "5.0" }));
  const d0 = versionDeltas(flat);
  check("unit: single version, short span → explains how to get more data", d0.basis === "none" && /pages/.test(d0.notes.join(" ")) && d0.whatGotWorse.length === 0);

  const since = versionDeltas(two, { sinceVersion: "1.9.5" });
  check("unit: since_version split", since.basis === "version" && since.latest.label === "1.9.5 and newer" && since.previous.label === "older than 1.9.5");
}

// --- GOOGLE_PLAY_ENABLED=false (hosted Apify mode); offline: every call fails before any request --
async function runPlayDisabled() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER],
    env: { ...process.env, BILLING: "", GOOGLE_PLAY_ENABLED: "false" },
    stderr: "pipe",
  });
  const client = new Client({ name: "smoke-test-play-disabled", version: "1.0.0" });
  await client.connect(transport);
  try {
    const GOOGLE_RE = /google|\bplay\b|android|package name/i;
    const COMING_SOON = (text) => /coming soon on the hosted version/i.test(text) && /open-source local server/i.test(text);
    check("play disabled: instructions don't mention Google Play", !GOOGLE_RE.test(client.getInstructions() ?? ""), client.getInstructions());

    const { tools } = await client.listTools();
    check("play disabled: still lists 4 tools", tools.length === 4);
    const leaks = tools.filter((t) => GOOGLE_RE.test(JSON.stringify({ title: t.title, description: t.description, annotations: t.annotations, inputSchema: t.inputSchema })));
    check("play disabled: no tool title/description/schema advertises Google Play", leaks.length === 0, leaks.map((t) => t.name).join(","));
    check("play disabled: no lang param", tools.every((t) => !t.inputSchema.properties?.lang));
    check(
      "play disabled: store param absent or apple-only",
      tools.every((t) => { const st = t.inputSchema.properties?.store; return !st || JSON.stringify(st.enum) === '["apple"]'; }),
      tools.map((t) => `${t.name}:${JSON.stringify(t.inputSchema.properties?.store?.enum ?? null)}`).join(" "),
    );

    const rejects = [
      ["search_apps store=google", "search_apps", { term: "instagram", store: "google" }],
      ["get_app_reviews package name", "get_app_reviews", { app_id: PLAY_SPOTIFY }],
      ["get_app_reviews Play URL", "get_app_reviews", { app_id: `https://play.google.com/store/apps/details?id=${PLAY_INSTAGRAM}` }],
      ["review_insights package name", "review_insights", { app_id: PLAY_INSTAGRAM }],
      ["review_insights store=google", "review_insights", { app_id: FACEBOOK, store: "google" }],
      ["compare_apps mixed Apple + Google", "compare_apps", { app_ids: [FACEBOOK, PLAY_SPOTIFY] }],
    ];
    for (const [label, tool, args] of rejects) {
      const { result } = await call(client, tool, args, { expectError: true });
      const text = result.content?.[0]?.text ?? "";
      check(`play disabled: ${label} → coming-soon error`, result.isError && COMING_SOON(text), text);
    }
    {
      const { result } = await call(client, "get_app_reviews", { app_id: "not-an-id" }, { expectError: true });
      const text = result.content?.[0]?.text ?? "";
      check("play disabled: invalid Apple id error stays Apple-only", result.isError && /app_id/i.test(text) && !GOOGLE_RE.test(text), text);
    }
  } finally {
    await client.close();
  }
}

async function runStdio() {
  const transport = new StdioClientTransport({
    command: process.execPath,
    args: [SERVER],
    env: { ...process.env, BILLING: "" },
    stderr: "pipe",
  });
  const stderr = [];
  transport.stderr?.on("data", (d) => stderr.push(String(d)));
  const client = new Client({ name: "smoke-test", version: "1.0.0" });
  await client.connect(transport);

  transcript.server = { ...client.getServerVersion(), instructions: client.getInstructions() };
  console.log(`Connected to ${transcript.server.name} ${transcript.server.version}`);

  // --- tools/list -----------------------------------------------------------
  const { tools } = await client.listTools();
  transcript.tools = tools;
  const names = tools.map((t) => t.name).sort();
  check("lists 4 tools", JSON.stringify(names) === JSON.stringify(["compare_apps", "get_app_reviews", "review_insights", "search_apps"]), names.join(","));
  check("every tool has an input schema & description", tools.every((t) => t.inputSchema?.type === "object" && t.description));
  check("server version 1.1.3", transcript.server.version === "1.1.3");
  check("descriptions stay concise (< 700 chars)", tools.every((t) => t.description.length < 700), tools.map((t) => t.description.length).join(","));
  check("every param has a description", tools.every((t) => Object.values(t.inputSchema.properties ?? {}).every((p) => p.description)));
  check("app tools accept store + lang", ["get_app_reviews", "review_insights"].every((n) => { const p = tools.find((t) => t.name === n)?.inputSchema.properties ?? {}; return p.store && p.lang; }));
  check("review_insights accepts optional since_version", !!tools.find((t) => t.name === "review_insights")?.inputSchema.properties?.since_version && !(tools.find((t) => t.name === "review_insights")?.inputSchema.required ?? []).includes("since_version"));

  // --- search_apps ------------------------------------------------------------
  {
    const { result, data } = await call(client, "search_apps", { term: "instagram", country: "us", limit: 5 });
    check("search_apps ok", !result.isError);
    check("search_apps returns results", data?.apps?.length > 0 && data.apps.length <= 5, `count=${data?.apps?.length}`);
    check("search_apps finds Instagram (389801252)", data?.apps?.some((a) => a.id === INSTAGRAM));
  }
  {
    const { result, data } = await call(client, "search_apps", { term: "facebook", limit: 3 });
    check("search_apps defaults country=us", !result.isError && data?.country === "us");
    check("search_apps finds Facebook (284882215)", data?.apps?.some((a) => a.id === FACEBOOK));
    check("search_apps defaults store=apple", data?.store === "apple");
  }
  {
    const { result, data } = await call(client, "search_apps", { term: "instagram", store: "google", limit: 5 });
    check("search_apps google ok", !result.isError);
    check("search_apps google finds com.instagram.android", data?.apps?.[0]?.id === PLAY_INSTAGRAM, data?.apps?.map((a) => a.id).join(","));
    check("search_apps google returns ratings & installs", typeof data?.apps?.[0]?.averageRating === "number" && !!data?.apps?.[0]?.installs);
    check("search_apps google respects limit", data?.apps?.length <= 5);
  }
  {
    const { result, data } = await call(client, "search_apps", { term: "meditation", store: "google", limit: 8 });
    check("search_apps google keyword search returns list results", !result.isError && data?.apps?.length >= 5 && data.apps.every((a) => a.id.includes(".") && a.name), `count=${data?.apps?.length}`);
  }

  // --- get_app_reviews ----------------------------------------------------------
  for (const [id, label] of [[FACEBOOK, "Facebook"], [INSTAGRAM, "Instagram"]]) {
    const { result, data } = await call(client, "get_app_reviews", { app_id: id, country: "us", pages: 2, sort: "mostrecent" });
    check(`get_app_reviews ${label} ok`, !result.isError);
    check(`get_app_reviews ${label} returns reviews`, data?.count > 0, `count=${data?.count}`);
    const r = data?.reviews?.[0];
    check(
      `get_app_reviews ${label} normalized shape`,
      r && ["id", "author", "rating", "title", "body", "version", "date"].every((k) => k in r) && r.rating >= 1 && r.rating <= 5,
    );
    check(`get_app_reviews ${label} no duplicate ids`, new Set(data?.reviews?.map((x) => x.id)).size === data?.reviews?.length);
  }
  {
    const { result, data } = await call(client, "get_app_reviews", { app_id: `https://apps.apple.com/us/app/instagram/id${INSTAGRAM}`, sort: "mosthelpful" });
    check("get_app_reviews accepts App Store URL + mosthelpful", !result.isError && data?.appId === INSTAGRAM && data?.count > 0);
  }
  {
    const { result, data } = await call(client, "get_app_reviews", { app_id: PLAY_SPOTIFY, pages: 2 });
    check("get_app_reviews google ok (store inferred)", !result.isError && data?.store === "google");
    check("get_app_reviews google returns ~100 reviews", data?.count > 50 && data?.count <= 100, `count=${data?.count}`);
    check("get_app_reviews google normalized shape", data?.reviews?.every((r) => r.id && r.rating >= 1 && r.rating <= 5 && typeof r.body === "string" && r.date));
    check("get_app_reviews google no duplicate ids", new Set(data?.reviews?.map((x) => x.id)).size === data?.reviews?.length);
    check("get_app_reviews google newest first", data?.reviews?.[0]?.date >= data?.reviews?.at(-1)?.date);
  }
  {
    const { result, data } = await call(client, "get_app_reviews", { app_id: `https://play.google.com/store/apps/details?id=${PLAY_INSTAGRAM}&hl=en`, sort: "mosthelpful" });
    check("get_app_reviews accepts Play URL + mosthelpful", !result.isError && data?.appId === PLAY_INSTAGRAM && data?.count > 0);
  }

  // --- review_insights ------------------------------------------------------------
  for (const [id, label] of [[FACEBOOK, "Facebook"], [INSTAGRAM, "Instagram"]]) {
    const { result, data } = await call(client, "review_insights", { app_id: id, countries: ["us", "gb"], pages: 3 });
    check(`review_insights ${label} ok`, !result.isError);
    const d = data?.ratingDistribution;
    check(`review_insights ${label} distribution sums to sample`, d && Object.values(d.counts).reduce((a, b) => a + b, 0) === d.total && d.total === data.sample.reviews);
    check(`review_insights ${label} covers both countries`, data?.sample?.byCountry?.us > 0 && data?.sample?.byCountry?.gb > 0, JSON.stringify(data?.sample?.byCountry));
    check(`review_insights ${label} has version breakdown`, data?.ratingByVersion?.length > 0);
    check(`review_insights ${label} has complaint keywords`, data?.complaintKeywords?.length > 0);
    check(`review_insights ${label} keywords exclude stopwords/filler`, !data?.complaintKeywords?.some((k) => k.phrase.split(" ").some((w) => FILLER.includes(w))), data?.complaintKeywords?.map((k) => k.phrase).join(", "));
    check(`review_insights ${label} keywords exclude app name`, !data?.complaintKeywords?.some((k) => k.phrase.includes(label.toLowerCase())));
    check(`review_insights ${label} has sample quotes`, data?.quotes?.negative?.length > 0);
    const vd = data?.versionDeltas;
    check(`review_insights ${label} has versionDeltas`, vd && ["version", "time", "none"].includes(vd.basis) && typeof vd.summary === "string" && Array.isArray(vd.whatGotWorse), vd?.summary);
    check(`review_insights ${label} versionDeltas explains or compares`, vd?.basis === "none" ? vd.notes.length > 0 : vd?.latest?.reviews > 0 && vd?.previous?.reviews > 0 && typeof vd?.change?.averageRating === "number");
  }
  {
    const { result, data } = await call(client, "review_insights", { app_id: PLAY_INSTAGRAM, pages: 6, quotes: 2 });
    check("review_insights google ok", !result.isError && data?.store === "google");
    check("review_insights google has app metadata", data?.app?.name === "Instagram" && typeof data?.storeRating?.ratingCount === "number" && !!data?.app?.installs);
    check("review_insights google sample size", data?.sample?.reviews >= 250, `n=${data?.sample?.reviews}`);
    check("review_insights google complaint keywords", data?.complaintKeywords?.length > 0 && !data.complaintKeywords.some((k) => k.phrase.split(" ").some((w) => FILLER.includes(w) || w === "instagram")), data?.complaintKeywords?.map((k) => k.phrase).join(", "));
    const vd = data?.versionDeltas;
    check("review_insights google versionDeltas by version", vd?.basis === "version" && vd.latest.reviews >= 5 && vd.previous.reviews >= 5, vd?.summary);
    check("review_insights google whatGotWorse entries are well-formed", (vd?.whatGotWorse ?? []).every((w) => w.change > 0 && w.latestShare >= w.previousShare && ["new", "increased"].includes(w.status) && w.examples?.length > 0));
  }

  // --- compare_apps -----------------------------------------------------------------
  {
    const { result, data } = await call(client, "compare_apps", { app_ids: [FACEBOOK, INSTAGRAM], country: "us", pages: 2 });
    check("compare_apps ok", !result.isError);
    check("compare_apps returns both apps", data?.apps?.length === 2 && data.apps.every((a) => a.found));
    check("compare_apps has metrics", data?.apps?.every((a) => typeof a.storeAverageRating === "number" && typeof a.recentAverageRating === "number"));
    check("compare_apps names leaders", !!data?.leaders?.storeAverageRating?.id);
  }
  {
    const { result, data } = await call(client, "compare_apps", { app_ids: ["324684580", PLAY_SPOTIFY], pages: 1 });
    check("compare_apps mixes Apple + Google", !result.isError && data?.apps?.map((a) => a.store).join(",") === "apple,google" && data.apps.every((a) => a.found && a.recentReviewSample > 0));
    check("compare_apps google row has installs + latest version", !!data?.apps?.[1]?.installs && !!data?.apps?.[1]?.latestVersion);
    check("compare_apps leaders carry store", !!data?.leaders?.storeAverageRating?.store);
  }

  // --- error handling ------------------------------------------------------------------
  {
    const { result } = await call(client, "get_app_reviews", { app_id: "not-an-id" }, { expectError: true });
    check("invalid app_id → isError", result.isError && /app_id/i.test(result.content?.[0]?.text ?? ""));
  }
  {
    const { result } = await call(client, "get_app_reviews", { app_id: FACEBOOK, pages: 11 }, { expectError: true });
    check("pages > 10 rejected by schema", result.isError);
  }
  {
    const { result } = await call(client, "search_apps", { term: "x", country: "usa" }, { expectError: true });
    check("invalid country rejected", result.isError);
  }
  {
    const { result } = await call(client, "compare_apps", { app_ids: [FACEBOOK] }, { expectError: true });
    check("compare_apps with 1 id rejected", result.isError);
  }
  {
    const { result, data } = await call(client, "get_app_reviews", { app_id: "999999999999" });
    check("unknown app → graceful empty result", !result.isError && data?.count === 0);
  }
  {
    const { result, data } = await call(client, "get_app_reviews", { app_id: "com.example.does.not.exist.zz" });
    check("unknown Play app → graceful empty result", !result.isError && data?.count === 0 && data?.store === "google");
  }
  {
    const { result } = await call(client, "get_app_reviews", { app_id: PLAY_SPOTIFY, store: "apple" }, { expectError: true });
    check("package name with store=apple → helpful error", result.isError && /google/i.test(result.content?.[0]?.text ?? ""));
  }
  {
    const { result } = await call(client, "review_insights", { app_id: FACEBOOK, store: "google" }, { expectError: true });
    check("numeric id with store=google → error", result.isError && /package/i.test(result.content?.[0]?.text ?? ""));
  }

  await client.close();
  return stderr.join("");
}

async function runHttp() {
  const child = spawn(process.execPath, [SERVER, "--http", "--port", "0"], { stdio: ["ignore", "ignore", "pipe"] });
  try {
    const url = await new Promise((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("HTTP server did not start")), 10_000);
      let buf = "";
      child.stderr.on("data", (d) => {
        buf += d;
        const m = buf.match(/(http:\/\/\S+\/mcp)/);
        if (m) { clearTimeout(timer); resolve(m[1]); }
      });
      child.on("exit", (code) => reject(new Error(`HTTP server exited with ${code}: ${buf}`)));
    });
    const health = await fetch(url.replace(/\/mcp$/, "/health")).then((r) => r.json());
    const client = new Client({ name: "smoke-test-http", version: "1.0.0" });
    await client.connect(new StreamableHTTPClientTransport(new URL(url)));
    const { tools } = await client.listTools();
    const res = await client.callTool({ name: "search_apps", arguments: { term: "instagram", limit: 1 } });
    await client.close();
    transcript.http = { url, health, tools: tools.map((t) => t.name), sampleCall: { tool: "search_apps", isError: !!res.isError, firstApp: res.structuredContent?.apps?.[0]?.name } };
    console.log(`→ HTTP ${url}: ${tools.length} tools`);
    check("HTTP mode: health endpoint", health?.status === "ok");
    check("HTTP mode: lists 4 tools", tools.length === 4);
    check("HTTP mode: tool call works", !res.isError && res.structuredContent?.apps?.length === 1);
  } finally {
    child.kill("SIGTERM");
  }
}

// --- Markdown rendering ----------------------------------------------------------------
const fence = (obj, max = 4000) => {
  let s = typeof obj === "string" ? obj : JSON.stringify(obj, null, 2);
  if (s.length > max) s = s.slice(0, max) + `\n… (truncated, ${s.length - max} more chars — see transcript.json)`;
  return "```json\n" + s + "\n```";
};
const pct = (x) => (x == null ? "–" : `${(x * 100).toFixed(1)}%`);
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|").replace(/\n/g, " ");

function renderCall(c) {
  const out = [`### \`${c.tool}\` ${c.isError ? "⚠️ (error)" : ""}`, "", `Arguments: \`${JSON.stringify(c.arguments)}\` · ${c.durationMs} ms`, ""];
  const d = c.result.structuredContent;
  if (c.isError || !d) {
    out.push("> " + esc(c.result.content?.[0]?.text), "");
    return out.join("\n");
  }
  if (c.tool === "search_apps") {
    out.push("| id | name | developer | rating | ratings | version |", "|---|---|---|---|---|---|");
    for (const a of d.apps) out.push(`| ${a.id} | ${esc(a.name)} | ${esc(a.developer)} | ${a.averageRating ?? "–"} | ${a.ratingCount?.toLocaleString("en-US") ?? a.installs ?? "–"} | ${a.version ?? "–"} |`);
  } else if (c.tool === "get_app_reviews") {
    out.push(`App **${d.appId}** (${d.store}) · ${d.country} · sort=${d.sort} · pages fetched ${d.pagesFetched}/${d.pagesRequested} · **${d.count} reviews**`, "");
    if (d.note) out.push(`_${d.note}_`, "");
    if (d.count) {
      out.push("| rating | version | date | title | body |", "|---|---|---|---|---|");
      for (const r of d.reviews.slice(0, 5)) out.push(`| ${"★".repeat(r.rating)} | ${r.version ?? "–"} | ${r.date?.slice(0, 10) ?? "–"} | ${esc(r.title)} | ${esc(r.body.slice(0, 140))}${r.body.length > 140 ? "…" : ""} |`);
      out.push("", `_(first 5 of ${d.count} shown)_`);
    }
  } else if (c.tool === "review_insights") {
    const dist = d.ratingDistribution;
    out.push(`**${esc(d.app.name ?? d.app.id)}** (${d.app.id}, ${d.store}) — sample of ${d.sample.reviews} recent reviews ${JSON.stringify(d.sample.byCountry)}, ${d.sample.dateRange.from?.slice(0, 10)} → ${d.sample.dateRange.to?.slice(0, 10)}`, "");
    out.push(`Store rating: **${d.storeRating?.averageRating ?? "–"}** over ${d.storeRating?.ratingCount?.toLocaleString("en-US") ?? "–"} ratings · Sample average: **${dist.average}**`, "");
    out.push("| ★ | count | % |", "|---|---|---|");
    for (const k of ["5", "4", "3", "2", "1"]) out.push(`| ${k} | ${dist.counts[k]} | ${dist.percent[k]}% |`);
    out.push("", "**Average rating by version (newest first)**", "", "| version | reviews | avg | % negative |", "|---|---|---|---|");
    for (const v of d.ratingByVersion.slice(0, 8)) out.push(`| ${v.version} | ${v.reviews} | ${v.averageRating} | ${pct(v.negativeShare)} |`);
    const vd = d.versionDeltas;
    out.push("", `**What changed (basis: ${vd.basis}, confidence: ${vd.confidence ?? "–"})** — ${esc(vd.summary)}`, "");
    for (const n of vd.notes) out.push(`- _${esc(n)}_`);
    if (vd.whatGotWorse.length) {
      out.push("", "| rising complaint | status | latest share | previous share | change | example |", "|---|---|---|---|---|---|");
      for (const w of vd.whatGotWorse) out.push(`| ${esc(w.phrase)} | ${w.status} | ${pct(w.latestShare)} | ${pct(w.previousShare)} | +${(w.change * 100).toFixed(1)} pp | ${esc(w.examples?.[0]?.text)} |`);
    }
    out.push("", `**Top complaint keywords (1–2★, n=${d.sample.negativeReviews})**`, "", "| phrase | reviews | share | example |", "|---|---|---|---|");
    for (const k of d.complaintKeywords) out.push(`| ${esc(k.phrase)} | ${k.reviews} | ${pct(k.share)} | ${esc(k.example)} |`);
    out.push("", "**Sample quotes**", "");
    for (const q of [...d.quotes.negative, ...d.quotes.positive]) out.push(`> ${"★".repeat(q.rating)} ${q.title ? `**${esc(q.title)}** — ` : ""}${esc(q.text)} _(v${q.version ?? "?"}, ${q.country}, ${q.date?.slice(0, 10)})_`, ">");
  } else if (c.tool === "compare_apps") {
    const cols = [
      ["name", (a) => esc(a.name)],
      ["developer", (a) => esc(a.developer)],
      ["store rating", (a) => a.storeAverageRating],
      ["store rating count", (a) => a.storeRatingCount?.toLocaleString("en-US")],
      ["installs", (a) => a.installs],
      ["current version", (a) => a.currentVersion],
      ["released", (a) => a.currentVersionReleaseDate?.slice(0, 10)],
      ["size (MB)", (a) => a.sizeMB],
      ["recent sample", (a) => a.recentReviewSample],
      ["recent avg", (a) => a.recentAverageRating],
      ["% negative (1–2★)", (a) => pct(a.recentNegativeShare)],
      ["% positive (4–5★)", (a) => pct(a.recentPositiveShare)],
      ["latest version avg", (a) => `${a.latestVersionAverageRating ?? "–"} (${a.latestVersion ?? "?"}, n=${a.latestVersionReviewCount})`],
      ["top complaints", (a) => a.topComplaints.map((k) => k.phrase).join(", ")],
    ];
    out.push(`| metric | ${d.apps.map((a) => `${a.id} (${a.store})`).join(" | ")} |`, `|---|${d.apps.map(() => "---").join("|")}|`);
    for (const [label, fn] of cols) out.push(`| ${label} | ${d.apps.map((a) => fn(a) ?? "–").join(" | ")} |`);
    out.push("", "**Leaders:** " + Object.entries(d.leaders).filter(([, v]) => v).map(([k, v]) => `${k}: ${esc(v.name)} (${v.value})`).join(" · "));
  }
  out.push("", "<details><summary>Raw response</summary>", "", fence(d), "", "</details>", "");
  return out.join("\n");
}

function renderMarkdown() {
  const passed = transcript.assertions.filter((a) => a.passed).length;
  const md = [
    `# app-review-intel-mcp — smoke test transcript`,
    "",
    `Generated ${transcript.generatedAt} by \`test/smoke.mjs\` against live Apple and Google Play endpoints. Server: **${transcript.server?.name} ${transcript.server?.version}** over stdio.`,
    "",
    `**Assertions: ${passed}/${transcript.assertions.length} passed.**`,
    "",
    "## Tools",
    "",
    ...transcript.tools.map((t) => `- **\`${t.name}\`** — ${t.description}\n  - params: ${Object.entries(t.inputSchema.properties ?? {}).map(([k, v]) => `\`${k}\`${(t.inputSchema.required ?? []).includes(k) ? "*" : ""} (${v.type ?? (v.anyOf ? v.anyOf.map((x) => x.type).join("|") : "?")})`).join(", ")}`),
    "",
    "## Calls",
    "",
    ...transcript.calls.map(renderCall),
    "## Streamable HTTP mode",
    "",
    transcript.http ? fence(transcript.http) : "_not run_",
    "",
    "## Assertions",
    "",
    ...transcript.assertions.map((a) => `- ${a.passed ? "✅" : "❌"} ${a.name}${a.detail ? ` — ${a.detail}` : ""}`),
    "",
  ];
  return md.join("\n");
}

async function main() {
  let serverStderr = "";
  try {
    await runUnit();
    await runPlayDisabled();
    serverStderr = await runStdio();
    await runHttp();
  } catch (err) {
    check("smoke test ran to completion", false, String(err?.stack ?? err));
  }
  if (serverStderr) transcript.serverStderr = serverStderr;
  await mkdir(DEMO, { recursive: true });
  await writeFile(join(DEMO, "transcript.json"), JSON.stringify(transcript, null, 2));
  await writeFile(join(DEMO, "transcript.md"), renderMarkdown());
  const passed = transcript.assertions.filter((a) => a.passed).length;
  console.log(`\n${passed}/${transcript.assertions.length} assertions passed. Transcript → demo/transcript.{json,md}`);
  process.exit(failures ? 1 : 0);
}

main();
