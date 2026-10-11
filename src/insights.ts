/** Pure, dependency-free analytics over normalized reviews. */
import type { Review } from "./itunes.js";
import { round, truncate } from "./util.js";

// Words ending in "s" that are not plurals.
const STEM_EXCEPTIONS = new Set(["ios", "ipados", "macos", "watchos", "tvos", "chaos", "news", "series", "species"]);

// English stopwords plus review boilerplate / filler that carries no complaint
// signal. Matching ignores apostrophes, so "don't", "don’t" and "dont" are all covered.
const STOPWORDS = new Set(
  `a about above after again against all almost also am an and any are aren't as at be because been before being
  below between both but by can can't cannot could couldn't did didn't do does doesn't doing don't down during each
  even ever every few for from further get gets getting got gotten had hadn't has hasn't have haven't having he he'd he'll
  he's her here here's hers herself him himself his how how's i i'd i'll i'm i've if in into is isn't it it's its
  itself just let's like me more most much must mustn't my myself no nor not now of off on once only or other ought
  our ours ourselves out over own really same shan't she she'd she'll she's should shouldn't so some still such than
  that that's the their theirs them themselves then there there's these they they'd they'll they're they've this
  those though through to too under until up upon us very was wasn't we we'd we'll we're we've were weren't what
  what's when when's where where's which while who who's whom why why's will with won't would wouldn't you you'd
  you'll you're you've your yours yourself yourselves
  im ive dont doesnt didnt cant wont isnt its thats youre theyre u ur pls plz lol omg ok okay yes yeah hi hello hey
  app apps application one also please thing things way lot lots many something anything everything nothing
  someone anyone everyone since back make makes made making going go goes went gone come comes came want wants wanted
  use used uses using know knew see seen saw say said says tell told thank thanks think thought time times day days
  new will would could yet already well good great never find found finding keep keeps kept keeping every
  actually literally always anymore another else instead maybe whole first last able guys etc gonna wanna
  seem seems seemed look looks looking put puts take takes took give gives gave let lets try tried trying
  star stars review reviews rating ratings update updated updates updating version versions
  without absolutely completely totally simply basically super extremely pretty quite enough right away little
  inc llc ltd corp co com www http https 1 2 3 4 5
  la el los las de del que en por para con una un es se lo mi y o muy pero esta este como al su
  le les des et est pas je il elle une du au ce qui avec pour sur
  der die das und ist nicht ich es ein eine mit auf zu den von sie`
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.replace(/'/g, "")),
);

// Words that are poor complaint topics on their own but meaningful inside a
// phrase ("not loading", "fix reels", "full screen"): excluded as unigrams only.
const LOW_SIGNAL_UNIGRAMS = new Set(
  `fix fixed fixing need needs needed people person latest recent recently bad terrible horrible
  awful worst worse hate hated stupid ridiculous annoying trash garbage useless sucks love loved best better
  open opened sure fb ig insta work works worked working phone start started starting`
    .split(/\s+/)
    .filter(Boolean)
    .map(stem),
);

const APOSTROPHES = /[’‘`´ʼ′]/g;

export function tokenize(text: string): string[] {
  return (
    text
      .toLowerCase()
      .replace(APOSTROPHES, "'")
      // keep letters (any script), digits and in-word apostrophes
      .replace(/[^\p{L}\p{N}']+/gu, " ")
      .split(" ")
      .map((t) => t.replace(/^'+|'+$/g, ""))
      .filter((t) => t.length > 0)
  );
}

/**
 * Light, conservative stemmer used only to merge variants of the same topic:
 * plurals (accounts → account, stories → story, crashes → crash) and
 * possessives (instagram's → instagram). Deliberately does not touch -ing/-ed.
 */
export function stem(token: string): string {
  let t = token.replace(/'s$/, "").replace(/'/g, "");
  if (t.length <= 2 || /\d/.test(t)) return t;
  if (t.endsWith("ies") && t.length > 4) return t.slice(0, -3) + "y";
  if (/(ss|us|is)$/.test(t) || STEM_EXCEPTIONS.has(t)) return t;
  if (/(sses|shes|ches|xes|zes)$/.test(t)) return t.slice(0, -2);
  if (t.endsWith("s")) return t.slice(0, -1);
  return t;
}

const isStopword = (t: string) => STOPWORDS.has(t.replace(/'/g, ""));

const isContent = (t: string, extraStop: Set<string>) =>
  t.length > 1 && !isStopword(t) && !extraStop.has(stem(t)) && !/^\d+$/.test(t);

export interface Keyword {
  phrase: string;
  /** n-gram size (1-3) */
  n: number;
  /** Number of reviews containing the phrase (ranking key). */
  reviews: number;
  /** Fraction of the analysed (negative) reviews that mention the phrase. */
  share: number;
  /** Raw term frequency across all reviews. */
  tf: number;
  /** Short example quote from a review that contains the phrase. */
  example?: string;
}

interface GramStat {
  /** Stemmed key, tokens joined by spaces. */
  key: string;
  n: number;
  tf: number;
  docs: Set<number>;
  /** Surface form → count; the most common one is displayed. */
  surfaces: Map<string, number>;
}

/**
 * Count stopword-filtered 1-3 word n-grams over reviews, merging plural /
 * possessive variants via `stem`. An n-gram is kept only if every token is a
 * content word, so "keeps crashing" → "crashing" and "the app is" → nothing.
 */
function ngramStats(reviews: Review[], extraStop: Set<string>): Map<string, GramStat> {
  const stats = new Map<string, GramStat>();
  reviews.forEach((r, idx) => {
    const tokens = tokenize(`${r.title}. ${r.body}`);
    const stems = tokens.map(stem);
    const content = tokens.map((t) => isContent(t, extraStop));
    for (let n = 1; n <= 3; n++) {
      for (let i = 0; i + n <= tokens.length; i++) {
        let okGram = true;
        for (let j = i; j < i + n; j++) if (!content[j]) okGram = false;
        if (!okGram) continue;
        const gramStems = stems.slice(i, i + n);
        if (n > 1 && new Set(gramStems).size < n) continue; // "bad bad", "account accounts"
        if (n === 1 && LOW_SIGNAL_UNIGRAMS.has(gramStems[0]!)) continue;
        const key = gramStems.join(" ");
        const surface = tokens.slice(i, i + n).join(" ");
        let s = stats.get(key);
        if (!s) stats.set(key, (s = { key, n, tf: 0, docs: new Set(), surfaces: new Map() }));
        s.tf++;
        s.docs.add(idx);
        s.surfaces.set(surface, (s.surfaces.get(surface) ?? 0) + 1);
      }
    }
  });
  return stats;
}

const displayPhrase = (s: GramStat) =>
  [...s.surfaces.entries()].sort((a, b) => b[1] - a[1] || a[0].length - b[0].length)[0]![0];

/**
 * Walk `ranked` in order and keep at most `limit` non-redundant phrases:
 *  - drop an n-gram when a longer phrase containing it (any candidate in
 *    `pool`) appears in >= 60% of its reviews ("screen" → "full screen");
 *  - drop a longer phrase when a shorter phrase it contains is already
 *    selected and the longer one covers < 50% of it (it adds little);
 *  - drop a phrase whose reviews overlap >= 80% with an already selected
 *    phrase of the same length that shares a word ("tiny window" / "small window").
 */
function selectNonRedundant(ranked: GramStat[], pool: GramStat[], limit: number, minDocs: number): GramStat[] {
  const longer = pool.filter((s) => s.n > 1 && s.docs.size >= minDocs);
  const selected: GramStat[] = [];
  for (const s of ranked) {
    if (selected.length >= limit) break;
    const subsumed = longer.some(
      (l) => l.n > s.n && containsPhrase(l.key, s.key) && overlap(l.docs, s.docs) >= 0.6 * s.docs.size,
    );
    if (subsumed) continue;
    if (selected.some((p) => p.n < s.n && containsPhrase(s.key, p.key) && s.docs.size < 0.5 * p.docs.size)) continue;
    if (
      selected.some(
        (p) =>
          p.n === s.n &&
          s.n > 1 &&
          sharesWord(p.key, s.key) &&
          overlap(p.docs, s.docs) >= 0.8 * Math.min(p.docs.size, s.docs.size),
      )
    ) {
      continue;
    }
    selected.push(s);
  }
  return selected;
}

function overlap(a: Set<number>, b: Set<number>): number {
  let n = 0;
  for (const x of a.size < b.size ? a : b) if ((a.size < b.size ? b : a).has(x)) n++;
  return n;
}

const sharesWord = (a: string, b: string) => {
  const wa = new Set(a.split(" "));
  return b.split(" ").some((w) => wa.has(w));
};

const stemSet = (words: Iterable<string>) => new Set([...words].map((w) => stem(w.toLowerCase())));

/**
 * Top complaint phrases over the given reviews, ranked by review (document)
 * frequency so a single ranting review cannot dominate (multi-word phrases
 * weighted up by 30% per extra word), with raw tf as tie-breaker. Redundant sub-/super-phrases are merged.
 */
export function topKeywords(
  reviews: Review[],
  opts: { limit?: number; minReviews?: number; extraStopwords?: Iterable<string> } = {},
): Keyword[] {
  const limit = opts.limit ?? 15;
  const minReviews = opts.minReviews ?? 2;
  const stats = [...ngramStats(reviews, stemSet(opts.extraStopwords ?? [])).values()].filter(
    (s) => s.docs.size >= minReviews,
  );
  // Multi-word phrases get a modest boost: "full screen" beats a slightly more frequent generic unigram.
  const score = (s: GramStat) => s.docs.size * (1 + 0.3 * (s.n - 1));
  const ranked = [...stats].sort((a, b) => score(b) - score(a) || b.tf - a.tf || b.n - a.n);

  return selectNonRedundant(ranked, stats, limit, minReviews).map((s) => {
    const phrase = displayPhrase(s);
    return {
      phrase,
      n: s.n,
      reviews: s.docs.size,
      share: reviews.length ? round(s.docs.size / reviews.length, 3) : 0,
      tf: s.tf,
      example: examplesFor(reviews, s.docs, phrase, 1)[0]?.text,
    };
  });
}

/**
 * Up to `count` snippets around `phrase`, preferring reviews that contain the
 * displayed wording verbatim, have not been quoted yet (`used`, updated in
 * place), and have helpful votes; one per author.
 */
function examplesFor(reviews: Review[], docs: Set<number>, phrase: string, count: number, used?: Set<Review>): Quote[] {
  const re = phraseRegex(phrase);
  const rank = (r: Review) => Number(re.test(norm(r))) * 2 + Number(!used?.has(r));
  const candidates = [...docs]
    .map((i) => reviews[i]!)
    .sort((a, b) => rank(b) - rank(a) || b.voteSum - a.voteSum || (b.date ?? "").localeCompare(a.date ?? ""));
  const out: Quote[] = [];
  const authors = new Set<string>();
  for (const r of candidates) {
    if (out.length >= count) break;
    if (authors.has(r.author)) continue;
    authors.add(r.author);
    used?.add(r);
    out.push({
      rating: r.rating,
      title: r.title,
      text: snippetAround(`${r.title ? `${r.title}. ` : ""}${r.body}`, phrase),
      author: r.author,
      version: r.version,
      date: r.date,
      country: r.country,
    });
  }
  return out;
}

const norm = (r: Review) => `${r.title}. ${r.body}`.replace(/\s+/g, " ").replace(APOSTROPHES, "'");

function containsPhrase(haystack: string, needle: string): boolean {
  return ` ${haystack} `.includes(` ${needle} `);
}

/** Whole-word, punctuation-tolerant matcher for a phrase. */
function phraseRegex(phrase: string): RegExp {
  const words = phrase.split(" ").map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  return new RegExp(`(?<![\\p{L}\\p{N}])${words.join("[^\\p{L}\\p{N}']+")}(?![\\p{L}\\p{N}])`, "iu");
}

/** Return a ~200 char snippet around the first loose match of `phrase`. */
function snippetAround(text: string, phrase: string, width = 200): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const m = phraseRegex(phrase).exec(clean.replace(APOSTROPHES, "'"));
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

// ---------------------------------------------------------------------------
// What changed between the latest version and earlier ones
// ---------------------------------------------------------------------------

export interface PeriodStat {
  label: string;
  versions: string[];
  reviews: number;
  negativeReviews: number;
  averageRating: number | null;
  negativeShare: number | null;
  dateRange: { from: string | null; to: string | null };
}

export interface PhraseDelta {
  phrase: string;
  /** new = absent from the baseline; gone = absent from the latest period. */
  status: "new" | "increased" | "decreased" | "gone";
  /** Share of the period's negative (1-2★) reviews mentioning the phrase. */
  latestShare: number;
  previousShare: number;
  /** latestShare − previousShare (fraction; 0.12 = +12 percentage points). */
  change: number;
  latestReviews: number;
  previousReviews: number;
  examples?: Quote[];
}

export interface VersionDeltas {
  /** How the sample was split: by app version, by date (fallback), or not at all. */
  basis: "version" | "time" | "none";
  latest: PeriodStat | null;
  previous: PeriodStat | null;
  change: { averageRating: number | null; negativeShare: number | null } | null;
  whatGotWorse: PhraseDelta[];
  whatImproved: PhraseDelta[];
  /** Based on the smaller period's negative-review count: <10 low, <30 medium, else high. */
  confidence: "low" | "medium" | "high" | null;
  summary: string;
  notes: string[];
}

const DAY_MS = 86_400_000;
const P_LABEL = (list: Review[]) => {
  const vs = [...new Set(list.map((r) => r.version!))].sort((a, b) => compareVersions(b, a));
  return vs.length === 1 ? `previous version ${vs[0]}` : `previous versions ${vs[vs.length - 1]}–${vs[0]}`;
};
const pctPts = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(round(x * 100, 1))} pp`;
const signed = (x: number) => `${x >= 0 ? "+" : "−"}${Math.abs(x).toFixed(2)}`;

function periodStat(label: string, list: Review[]): PeriodStat {
  const neg = list.filter((r) => r.rating <= 2).length;
  const dates = list.map((r) => r.date).filter((d): d is string => !!d).sort();
  const versions = [...new Set(list.map((r) => r.version).filter((v): v is string => !!v))].sort((a, b) =>
    compareVersions(b, a),
  );
  return {
    label,
    versions: versions.length > 8 ? [...versions.slice(0, 8), `…${versions.length - 8} more`] : versions,
    reviews: list.length,
    negativeReviews: neg,
    averageRating: list.length ? round(list.reduce((s, r) => s + r.rating, 0) / list.length, 2) : null,
    negativeShare: list.length ? round(neg / list.length, 3) : null,
    dateRange: { from: dates[0] ?? null, to: dates[dates.length - 1] ?? null },
  };
}

/** Split reviews into [latest, previous] by version. Newer versions too small to stand alone join the latest group. */
function splitByVersion(
  reviews: Review[],
  minGroup: number,
  sinceVersion?: string,
): { latest: Review[]; previous: Review[]; label: string } | null {
  const versioned = reviews.filter((r) => r.version);
  if (sinceVersion) {
    const latest = versioned.filter((r) => compareVersions(r.version!, sinceVersion) >= 0);
    const previous = versioned.filter((r) => compareVersions(r.version!, sinceVersion) < 0);
    return { latest, previous, label: `${sinceVersion} and newer` };
  }
  const versions = ratingByVersion(versioned);
  let acc = 0;
  for (let i = 0; i < versions.length; i++) {
    acc += versions[i]!.reviews;
    if (acc >= minGroup) {
      const cut = versions[i]!.version;
      const latest = versioned.filter((r) => compareVersions(r.version!, cut) >= 0);
      // Baseline = the immediately preceding version(s), widened until it holds
      // PREVIOUS_TARGET reviews, so users stuck on years-old builds don't skew it.
      let floor: string | null = null;
      let prevCount = 0;
      for (const v of versions.slice(i + 1)) {
        floor = v.version;
        prevCount += v.reviews;
        if (prevCount >= PREVIOUS_TARGET) break;
      }
      const previous = floor
        ? versioned.filter((r) => compareVersions(r.version!, cut) < 0 && compareVersions(r.version!, floor!) >= 0)
        : [];
      return { latest, previous, label: i === 0 ? cut : `${cut} and newer` };
    }
  }
  return null;
}

const PREVIOUS_TARGET = 30;

/**
 * Compare the latest app version in the sample against earlier versions:
 * rating / negative-share change plus the complaint phrases whose share of
 * negative reviews rose (or fell) the most. Falls back to "last N days vs
 * earlier" when the sample holds a single version, and explains when neither
 * split is possible.
 */
export function versionDeltas(
  reviews: Review[],
  opts: {
    sinceVersion?: string;
    extraStopwords?: Iterable<string>;
    limit?: number;
    examples?: number;
    minGroup?: number;
    recentDays?: number;
  } = {},
): VersionDeltas {
  const limit = opts.limit ?? 8;
  const minGroup = opts.minGroup ?? 5;
  const recentDays = opts.recentDays ?? 3;
  const notes: string[] = [];
  const empty = (summary: string): VersionDeltas => ({
    basis: "none",
    latest: null,
    previous: null,
    change: null,
    whatGotWorse: [],
    whatImproved: [],
    confidence: null,
    summary,
    notes,
  });

  let basis: "version" | "time" = "version";
  let latest: Review[] = [];
  let previous: Review[] = [];
  let latestLabel = "";
  let previousLabel = "";

  const byVersion = splitByVersion(reviews, minGroup, opts.sinceVersion);
  if (byVersion && byVersion.latest.length >= minGroup && byVersion.previous.length >= minGroup) {
    ({ latest, previous } = byVersion);
    latestLabel = byVersion.label;
    previousLabel = opts.sinceVersion
      ? `older than ${opts.sinceVersion}`
      : P_LABEL(byVersion.previous);
  } else {
    const versionsInSample = new Set(reviews.map((r) => r.version).filter(Boolean));
    if (opts.sinceVersion) {
      notes.push(
        `since_version ${opts.sinceVersion}: ${byVersion?.latest.length ?? 0} reviews at/after it and ` +
          `${byVersion?.previous.length ?? 0} before it; need ${minGroup}+ on each side.`,
      );
    } else if (versionsInSample.size <= 1) {
      notes.push(
        versionsInSample.size === 1
          ? `Only one app version (${[...versionsInSample][0]}) is present in the sample, so a version-to-version comparison is not possible.`
          : "Reviews in the sample carry no version information.",
      );
    } else {
      notes.push(`Earlier versions have fewer than ${minGroup} reviews in the sample; too few to compare.`);
    }
    // Fallback: most recent N days vs everything before (3 days, or 1 day for short samples).
    const dated = reviews.filter((r) => r.date && !Number.isNaN(Date.parse(r.date)));
    const times = dated.map((r) => Date.parse(r.date!));
    const newest = Math.max(...times);
    const spanDays = dated.length ? (newest - Math.min(...times)) / DAY_MS : 0;
    const hint =
      "To reach earlier versions, raise `pages` (up to 10), add more `countries`, or pass `since_version` " +
      "to choose the split point.";
    let windowDays = 0;
    for (const days of [recentDays, 1]) {
      if (spanDays < days * 1.5) continue;
      const cutoff = newest - days * DAY_MS;
      const recent = dated.filter((r) => Date.parse(r.date!) > cutoff);
      const earlier = dated.filter((r) => Date.parse(r.date!) <= cutoff);
      if (recent.length >= minGroup && earlier.length >= minGroup) {
        windowDays = days;
        latest = recent;
        previous = earlier;
        break;
      }
    }
    if (!windowDays) {
      notes.push(
        `The sample covers only ${round(spanDays, 1)} days, so a "recent days vs earlier" comparison ` +
          `is not possible either. ${hint}`,
      );
      return empty(`No comparison: ${notes[0]}`);
    }
    const windowLabel = windowDays === 1 ? "last 24 hours" : `last ${windowDays} days`;
    notes.push(`Fell back to comparing the ${windowLabel} against earlier reviews in the sample. ${hint}`);
    basis = "time";
    latestLabel = windowLabel;
    previousLabel = `the ${round(spanDays - windowDays, 1)} days before that`;
  }

  const L = periodStat(latestLabel, latest);
  const P = periodStat(previousLabel, previous);
  const change = {
    averageRating: L.averageRating !== null && P.averageRating !== null ? round(L.averageRating - P.averageRating, 2) : null,
    negativeShare: L.negativeShare !== null && P.negativeShare !== null ? round(L.negativeShare - P.negativeShare, 3) : null,
  };
  const smallerNeg = Math.min(L.negativeReviews, P.negativeReviews);
  const confidence = smallerNeg < 10 ? "low" : smallerNeg < 30 ? "medium" : "high";

  // Phrase deltas over negative reviews of each period.
  const extraStop = stemSet(opts.extraStopwords ?? []);
  const latestNeg = latest.filter((r) => r.rating <= 2);
  const prevNeg = previous.filter((r) => r.rating <= 2);
  const ls = ngramStats(latestNeg, extraStop);
  const ps = ngramStats(prevNeg, extraStop);
  const share = (s: GramStat | undefined, total: number) => (s && total ? s.docs.size / total : 0);
  const minLatest = Math.max(2, Math.ceil(0.03 * latestNeg.length));
  const minPrev = Math.max(2, Math.ceil(0.03 * prevNeg.length));
  const THRESHOLD = 0.03;

  const quoted = new Set<Review>();
  let whatGotWorse: PhraseDelta[] = [];
  let whatImproved: PhraseDelta[] = [];
  if (latestNeg.length >= 3) {
    const rising = [...ls.values()]
      .filter((s) => s.docs.size >= minLatest)
      .map((s) => ({ s, d: share(s, latestNeg.length) - share(ps.get(s.key), prevNeg.length) }))
      .filter((x) => x.d >= THRESHOLD);
    const delta = new Map(rising.map((x) => [x.s.key, x.d]));
    rising.sort((a, b) => b.d - a.d || b.s.docs.size - a.s.docs.size || b.s.n - a.s.n);
    whatGotWorse = selectNonRedundant(
      rising.map((x) => x.s),
      rising.map((x) => x.s),
      limit,
      minLatest,
    ).map((s) => {
      const phrase = displayPhrase(s);
      const prev = ps.get(s.key);
      return {
        phrase,
        status: prev ? "increased" : "new",
        latestShare: round(share(s, latestNeg.length), 3),
        previousShare: round(share(prev, prevNeg.length), 3),
        change: round(delta.get(s.key)!, 3),
        latestReviews: s.docs.size,
        previousReviews: prev?.docs.size ?? 0,
        examples: examplesFor(latestNeg, s.docs, phrase, opts.examples ?? 2, quoted),
      };
    });
  } else {
    notes.push(`Only ${latestNeg.length} negative reviews in the latest period; complaint deltas skipped.`);
  }
  if (prevNeg.length >= 3) {
    const falling = [...ps.values()]
      .filter((s) => s.docs.size >= minPrev)
      .map((s) => ({ s, d: share(ls.get(s.key), latestNeg.length) - share(s, prevNeg.length) }))
      .filter((x) => x.d <= -THRESHOLD);
    const delta = new Map(falling.map((x) => [x.s.key, x.d]));
    falling.sort((a, b) => a.d - b.d || b.s.docs.size - a.s.docs.size || b.s.n - a.s.n);
    whatImproved = selectNonRedundant(
      falling.map((x) => x.s),
      falling.map((x) => x.s),
      Math.min(5, limit),
      minPrev,
    ).map((s) => {
      const cur = ls.get(s.key);
      return {
        phrase: displayPhrase(s),
        status: cur ? "decreased" : "gone",
        latestShare: round(share(cur, latestNeg.length), 3),
        previousShare: round(share(s, prevNeg.length), 3),
        change: round(delta.get(s.key)!, 3),
        latestReviews: cur?.docs.size ?? 0,
        previousReviews: s.docs.size,
      };
    });
  }

  const parts = [
    `${basis === "version" ? `Version ${L.label}` : `The ${L.label}`} (${L.reviews} reviews) average ` +
      `${L.averageRating?.toFixed(2)}★ vs ${P.averageRating?.toFixed(2)}★ for ${P.label} (${P.reviews} reviews)` +
      (change.averageRating !== null ? `, ${signed(change.averageRating)}` : "") +
      (change.negativeShare !== null
        ? `; negative share ${round((L.negativeShare ?? 0) * 100, 1)}% vs ${round((P.negativeShare ?? 0) * 100, 1)}% (${pctPts(change.negativeShare)}).`
        : "."),
  ];
  if (whatGotWorse.length) {
    parts.push(
      "Rising complaints: " +
        whatGotWorse
          .slice(0, 3)
          .map((w) => `"${w.phrase}" (${w.status === "new" ? "new" : pctPts(w.change)}, ${round(w.latestShare * 100, 1)}% of negative reviews)`)
          .join(", ") +
        ".",
    );
  } else if (latestNeg.length >= 3) {
    parts.push("No complaint phrase rose by 3+ percentage points.");
  }
  if (confidence === "low") parts.push("Low confidence: few negative reviews in one of the periods.");

  return {
    basis,
    latest: L,
    previous: P,
    change,
    whatGotWorse,
    whatImproved,
    confidence,
    summary: parts.join(" "),
    notes,
  };
}
