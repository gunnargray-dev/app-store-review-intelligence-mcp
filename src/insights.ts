/** Pure, dependency-free analytics over normalized reviews. */
import type { Review } from "./itunes.js";
import { round, truncate } from "./util.js";

// English stopwords plus review boilerplate that carries no complaint signal.
const STOPWORDS = new Set(
  `a about above after again against all almost also am an and any are aren't as at be because been before being
  below between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each
  even ever every few for from further get gets getting got had hadn't has hasn't have haven't having he he'd he'll
  he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its
  itself just let's like me more most much must mustn't my myself no nor not now of off on once only or other ought
  our ours ourselves out over own really same shan't she she'd she'll she's should shouldn't so some still such than
  that that's the their theirs them themselves then there there's these they they'd they'll they're they've this
  those though through to too under until up upon us very was wasn't we we'd we'll we're we've were weren't what
  what's when when's where where's which while who who's whom why why's will with won't would wouldn't you you'd
  you'll you're you've your yours yourself yourselves
  im ive dont doesnt didnt cant wont isnt its thats youre theyre
  app apps application one also please thing things way lot lots many something anything everything nothing
  someone anyone everyone since back make makes made going go goes want wants use used using us know see say
  said thank thanks think time times day days new will would could yet already ok okay well good great
  star stars review reviews rating ratings update updated updates version 1 2 3 4 5`
    .split(/\s+/)
    .filter(Boolean),
);

// Words that are poor complaint topics on their own but meaningful inside a
// phrase ("keeps crashing", "fix reels", "full screen"): excluded as unigrams only.
const LOW_SIGNAL_UNIGRAMS = new Set(
  `fix fixed fixing need needs needed keep keeps kept people person latest recent recently bad terrible horrible
  awful worst worse hate hated stupid ridiculous annoying trash garbage useless sucks love loved best better
  try tried trying open opened let lets take takes put puts give gives sure fb ig insta`
    .split(/\s+/)
    .filter(Boolean),
);

export function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(/[’‘`]/g, "'")
      // keep letters (any script), digits and in-word apostrophes
      .replace(/[^\p{L}\p{N}']+/gu, " ")
      .split(" ")
      .map((t) => t.replace(/^'+|'+$/g, ""))
      .filter((t) => t.length > 0)
  );
}

const isContent = (t: string, extraStop: Set<string>) =>
  t.length > 1 && !STOPWORDS.has(t) && !extraStop.has(t) && !/^\d+$/.test(t);

export interface Keyword {
  phrase: string;
  /** n-gram size (1-3) */
  n: number;
  /** Number of reviews containing the phrase (ranking key). */
  reviews: number;
  /** Raw term frequency across all reviews. */
  tf: number;
  /** Short example quote from a review that contains the phrase. */
  example?: string;
}

/**
 * Stopword-filtered n-gram term frequency over the given reviews.
 * An n-gram is kept only if every token is a content word (no stopwords),
 * so phrases like "keeps crashing" or "log in" (→ "log") survive while
 * "the app is" does not. Ranking uses review (document) frequency so a single
 * ranting review cannot dominate, with raw tf as tie-breaker.
 * Shorter n-grams that are almost entirely explained by a longer selected
 * n-gram are suppressed to reduce redundancy.
 */
export function topKeywords(
  reviews: Review[],
  opts: { limit?: number; minReviews?: number; extraStopwords?: Iterable<string> } = {},
): Keyword[] {
  const limit = opts.limit ?? 15;
  const minReviews = opts.minReviews ?? 2;
  const extraStop = new Set([...(opts.extraStopwords ?? [])].map((s) => s.toLowerCase()));

  const stats = new Map<string, { n: number; tf: number; docs: Set<number> }>();
  reviews.forEach((r, idx) => {
    const tokens = tokenize(`${r.title}. ${r.body}`);
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i + n <= tokens.length; i++) {
        const gram = tokens.slice(i, i + n);
        if (!gram.every((t) => isContent(t, extraStop))) continue;
        if (n > 1 && new Set(gram).size < n) continue; // "bad bad"
        if (n === 1 && LOW_SIGNAL_UNIGRAMS.has(gram[0]!)) continue;
        const key = gram.join(" ");
        let s = stats.get(key);
        if (!s) stats.set(key, (s = { n, tf: 0, docs: new Set() }));
        s.tf++;
        s.docs.add(idx);
      }
    }
  });

  const ranked = [...stats.entries()]
    .filter(([, s]) => s.docs.size >= minReviews)
    .sort((a, b) => b[1].docs.size - a[1].docs.size || b[1].tf - a[1].tf || b[1].n - a[1].n);

  // Prefer longer phrases: drop an n-gram when a longer n-gram containing it
  // covers >= 70% of its reviews, and skip a longer n-gram that covers < 50%
  // of the reviews of a shorter phrase already selected.
  const selected: [string, { n: number; tf: number; docs: Set<number> }][] = [];
  const longer = ranked.filter(([, s]) => s.n > 1);
  for (const entry of ranked) {
    const [phrase, s] = entry;
    if (selected.length >= limit) break;
    const subsumed = longer.some(
      ([p2, s2]) => s2.n > s.n && s2.docs.size >= Math.max(minReviews, 0.7 * s.docs.size) && containsPhrase(p2, phrase),
    );
    if (subsumed) continue;
    if (selected.some(([p2, s2]) => s2.n < s.n && containsPhrase(phrase, p2) && s.docs.size < 0.5 * s2.docs.size)) {
      continue;
    }
    selected.push(entry);
  }

  return selected.map(([phrase, s]) => {
    const exampleReview = reviews[[...s.docs][0]!];
    return {
      phrase,
      n: s.n,
      reviews: s.docs.size,
      tf: s.tf,
      example: exampleReview ? snippetAround(`${exampleReview.title}. ${exampleReview.body}`, phrase) : undefined,
    };
  });
}

function containsPhrase(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}

/** Return a ~200 char snippet around the first loose match of `phrase`. */
function snippetAround(text: string, phrase: string, width = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const words = phrase.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  const re = new RegExp(words.join("[^\\p{L}\\p{N}']+"), "iu");
  const m = re.exec(clean.replace(/[’‘`]/g, "'"));
  if (!m || clean.length <= width) return truncate(clean, width);
  const start = Math.max(0, m.index - Math.floor(width / 3));
  const piece = clean.slice(start, start + width);
  return (start > 0 ? "…" : "") + truncate(piece, width);
}

export type RatingDistribution = Record<"1" | "2" | "3" | "4" | "5", number>;

export function ratingDistribution(reviews: Review[]): {
  counts: RatingDistribution;
  percent: RatingDistribution;
  average: number | null;
  total: number;
} {
  const counts: RatingDistribution = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };
  for (const r of reviews) counts[String(r.rating) as keyof RatingDistribution]++;
  const total = reviews.length;
  const percent = Object.fromEntries(
    Object.entries(counts).map(([k, v]) => [k, total ? round((100 * v) / total, 1) : 0]),
  ) as RatingDistribution;
  const average = total ? round(reviews.reduce((s, r) => s + r.rating, 0) / total, 2) : null;
  return { counts, percent, average, total };
}

/** Compare dotted version strings numerically (e.g. 450.1.0 > 45.10.0). */
export function compareVersions(a: string, b: string): number {
  const pa = a.split(/[.\-]/);
  const pb = b.split(/[.\-]/);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] ?? "0";
    const y = pb[i] ?? "0";
    const nx = Number(x);
    const ny = Number(y);
    if (Number.isFinite(nx) && Number.isFinite(ny)) {
      if (nx !== ny) return nx - ny;
    } else if (x !== y) return x < y ? -1 : 1;
  }
  return 0;
}

export interface VersionStat {
  version: string;
  reviews: number;
  averageRating: number;
  negativeShare: number;
  firstSeen: string | null;
  lastSeen: string | null;
}

/** Average rating per app version, newest version first. */
export function ratingByVersion(reviews: Review[]): VersionStat[] {
  const groups = new Map<string, Review[]>();
  for (const r of reviews) {
    const v = r.version ?? "unknown";
    const list = groups.get(v) ?? [];
    list.push(r);
    groups.set(v, list);
  }
  return [...groups.entries()]
    .map(([version, list]) => {
      const dates = list.map((r) => r.date).filter((d): d is string => !!d).sort();
      return {
        version,
        reviews: list.length,
        averageRating: round(list.reduce((s, r) => s + r.rating, 0) / list.length, 2),
        negativeShare: round(list.filter((r) => r.rating <= 2).length / list.length, 3),
        firstSeen: dates[0] ?? null,
        lastSeen: dates[dates.length - 1] ?? null,
      };
    })
    .sort((a, b) =>
      a.version === "unknown" ? 1 : b.version === "unknown" ? -1 : compareVersions(b.version, a.version),
    );
}

export interface Quote {
  rating: number;
  title: string;
  text: string;
  author: string;
  version: string | null;
  date: string | null;
  country: string;
}

/**
 * Pick representative quotes: prefer reviews with helpful votes, substantive
 * length (not one-liners, not walls of text) and distinct versions/authors.
 */
export function sampleQuotes(reviews: Review[], count: number, maxChars = 280): Quote[] {
  const scored = reviews
    .filter((r) => r.body.length >= 40)
    .map((r) => {
      const len = r.body.length;
      const lengthScore = len < 80 ? 0.4 : len <= 600 ? 1 : 0.7;
      return { r, score: lengthScore + Math.log1p(Math.max(0, r.voteSum)) * 0.5 };
    })
    .sort((a, b) => b.score - a.score || (b.r.date ?? "").localeCompare(a.r.date ?? ""));

  const out: Quote[] = [];
  const authors = new Set<string>();
  for (const { r } of scored) {
    if (out.length >= count) break;
    if (authors.has(r.author)) continue;
    authors.add(r.author);
    out.push({
      rating: r.rating,
      title: r.title,
      text: truncate(r.body, maxChars),
      author: r.author,
      version: r.version,
      date: r.date,
      country: r.country,
    });
  }
  return out;
}

/** Tokens from an app/developer name that should not count as complaint keywords. */
export function nameStopwords(...names: (string | null | undefined)[]): string[] {
  return names.flatMap((n) => (n ? tokenize(n) : [])).filter((t) => t.length > 1);
}
