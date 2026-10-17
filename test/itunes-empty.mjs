#!/usr/bin/env node
/** Offline check: empty pages in Apple's review feed must not end the feed. Mocks global fetch. */
import assert from "node:assert/strict";
import { fetchReviews } from "../dist/itunes.js";

const entries = (page) =>
  Array.from({ length: 50 }, (_, i) => ({
    id: { label: `p${page}-${i}` },
    author: { name: { label: "a" } },
    "im:rating": { label: "3" },
    title: { label: "t" },
    content: { label: "c" },
    updated: { label: "2026-10-01T00:00:00-07:00" },
  }));

function mock(nonEmpty) {
  const calls = [];
  globalThis.fetch = async (url) => {
    const page = Number(/page=(\d+)/.exec(String(url))[1]);
    calls.push(page);
    const feed = nonEmpty.has(page) ? { entry: entries(page) } : {};
    return new Response(JSON.stringify({ feed }), { status: 200 });
  };
  return calls;
}

// Empty page 1 between non-empty pages is skipped, not treated as end of feed.
let calls = mock(new Set([2, 3]));
let r = await fetchReviews("1001", "us", 3, "mostrecent");
assert.equal(r.reviews.length, 100);
assert.equal(r.pagesFetched, 2);
assert.equal(r.emptyPages, 1);
assert.equal(calls.length, 3, "no probing when at least half of the requested reviews arrived");

// Mostly empty: remaining pages are probed (max 10 requests) and the result is capped at pages*50.
calls = mock(new Set([2, 10]));
r = await fetchReviews("1002", "us", 1, "mostrecent");
assert.equal(r.reviews.length, 50);
assert.equal(r.pagesFetched, 1);
assert.equal(r.emptyPages, 3); // probing stops once the requested amount is reached
assert.ok(calls.length <= 10);

// Everything empty: zero reviews, all pages reported empty, still at most 10 requests.
calls = mock(new Set());
r = await fetchReviews("1003", "us", 2, "mostrecent");
assert.equal(r.reviews.length, 0);
assert.equal(r.emptyPages, 10);
assert.equal(calls.length, 10);
console.log("itunes-empty: ok");
