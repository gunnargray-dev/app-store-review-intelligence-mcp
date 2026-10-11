#!/usr/bin/env node
/**
 * End-to-end smoke test.
 *  - Spawns the built server (dist/index.js) over stdio with the MCP SDK Client
 *  - Lists tools and calls every tool against real apps:
 *      284882215 (Facebook) and 389801252 (Instagram)
 *  - Exercises input-validation / error paths
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

  // --- review_insights ------------------------------------------------------------
  for (const [id, label] of [[FACEBOOK, "Facebook"], [INSTAGRAM, "Instagram"]]) {
    const { result, data } = await call(client, "review_insights", { app_id: id, countries: ["us", "gb"], pages: 3 });
    check(`review_insights ${label} ok`, !result.isError);
    const d = data?.ratingDistribution;
    check(`review_insights ${label} distribution sums to sample`, d && Object.values(d.counts).reduce((a, b) => a + b, 0) === d.total && d.total === data.sample.reviews);
    check(`review_insights ${label} covers both countries`, data?.sample?.byCountry?.us > 0 && data?.sample?.byCountry?.gb > 0, JSON.stringify(data?.sample?.byCountry));
    check(`review_insights ${label} has version breakdown`, data?.ratingByVersion?.length > 0);
    check(`review_insights ${label} has complaint keywords`, data?.complaintKeywords?.length > 0);
    check(`review_insights ${label} keywords exclude stopwords`, !data?.complaintKeywords?.some((k) => ["the", "app", "and", "is"].includes(k.phrase)));
    check(`review_insights ${label} has sample quotes`, data?.quotes?.negative?.length > 0);
  }

  // --- compare_apps -----------------------------------------------------------------
  {
    const { result, data } = await call(client, "compare_apps", { app_ids: [FACEBOOK, INSTAGRAM], country: "us", pages: 2 });
    check("compare_apps ok", !result.isError);
    check("compare_apps returns both apps", data?.apps?.length === 2 && data.apps.every((a) => a.found));
    check("compare_apps has metrics", data?.apps?.every((a) => typeof a.storeAverageRating === "number" && typeof a.recentAverageRating === "number"));
    check("compare_apps names leaders", !!data?.leaders?.storeAverageRating?.id);
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
    for (const a of d.apps) out.push(`| ${a.id} | ${esc(a.name)} | ${esc(a.developer)} | ${a.averageRating ?? "–"} | ${a.ratingCount?.toLocaleString("en-US") ?? "–"} | ${a.version ?? "–"} |`);
  } else if (c.tool === "get_app_reviews") {
    out.push(`App **${d.appId}** · ${d.country} · sort=${d.sort} · pages fetched ${d.pagesFetched}/${d.pagesRequested} · **${d.count} reviews**`, "");
    if (d.note) out.push(`_${d.note}_`, "");
    if (d.count) {
      out.push("| rating | version | date | title | body |", "|---|---|---|---|---|");
      for (const r of d.reviews.slice(0, 5)) out.push(`| ${"★".repeat(r.rating)} | ${r.version ?? "–"} | ${r.date?.slice(0, 10) ?? "–"} | ${esc(r.title)} | ${esc(r.body.slice(0, 140))}${r.body.length > 140 ? "…" : ""} |`);
      out.push("", `_(first 5 of ${d.count} shown)_`);
    }
  } else if (c.tool === "review_insights") {
    const dist = d.ratingDistribution;
    out.push(`**${esc(d.app.name ?? d.app.id)}** (${d.app.id}) — sample of ${d.sample.reviews} recent reviews ${JSON.stringify(d.sample.byCountry)}, ${d.sample.dateRange.from?.slice(0, 10)} → ${d.sample.dateRange.to?.slice(0, 10)}`, "");
    out.push(`Store rating: **${d.storeRating?.averageRating ?? "–"}** over ${d.storeRating?.ratingCount?.toLocaleString("en-US") ?? "–"} ratings · Sample average: **${dist.average}**`, "");
    out.push("| ★ | count | % |", "|---|---|---|");
    for (const k of ["5", "4", "3", "2", "1"]) out.push(`| ${k} | ${dist.counts[k]} | ${dist.percent[k]}% |`);
    out.push("", "**Average rating by version (newest first)**", "", "| version | reviews | avg | % negative |", "|---|---|---|---|");
    for (const v of d.ratingByVersion.slice(0, 8)) out.push(`| ${v.version} | ${v.reviews} | ${v.averageRating} | ${pct(v.negativeShare)} |`);
    out.push("", `**Top complaint keywords (1–2★, n=${d.sample.negativeReviews})**`, "", "| phrase | reviews | tf | example |", "|---|---|---|---|");
    for (const k of d.complaintKeywords) out.push(`| ${esc(k.phrase)} | ${k.reviews} | ${k.tf} | ${esc(k.example)} |`);
    out.push("", "**Sample quotes**", "");
    for (const q of [...d.quotes.negative, ...d.quotes.positive]) out.push(`> ${"★".repeat(q.rating)} **${esc(q.title)}** — ${esc(q.text)} _(v${q.version ?? "?"}, ${q.country}, ${q.date?.slice(0, 10)})_`, ">");
  } else if (c.tool === "compare_apps") {
    const cols = [
      ["name", (a) => esc(a.name)],
      ["developer", (a) => esc(a.developer)],
      ["store rating", (a) => a.storeAverageRating],
      ["store rating count", (a) => a.storeRatingCount?.toLocaleString("en-US")],
      ["current version", (a) => a.currentVersion],
      ["released", (a) => a.currentVersionReleaseDate?.slice(0, 10)],
      ["size (MB)", (a) => a.sizeMB],
      ["recent sample", (a) => a.recentReviewSample],
      ["recent avg", (a) => a.recentAverageRating],
      ["% negative (1–2★)", (a) => pct(a.recentNegativeShare)],
      ["% positive (4–5★)", (a) => pct(a.recentPositiveShare)],
      ["latest version avg", (a) => `${a.latestVersionAverageRating ?? "–"} (n=${a.latestVersionReviewCount})`],
      ["top complaints", (a) => a.topComplaints.map((k) => k.phrase).join(", ")],
    ];
    out.push(`| metric | ${d.apps.map((a) => a.id).join(" | ")} |`, `|---|${d.apps.map(() => "---").join("|")}|`);
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
    `Generated ${transcript.generatedAt} by \`test/smoke.mjs\` against live Apple endpoints. Server: **${transcript.server?.name} ${transcript.server?.version}** over stdio.`,
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
