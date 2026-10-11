/**
 * Usage metering + Apify platform integration.
 *
 * `chargeEvent(name, count)` is called by every tool after it has successfully
 * produced a result. By default it is a strict no-op: nothing is recorded,
 * nothing is sent anywhere.
 *
 * When `BILLING=apify` is set (the default in the Docker image), events are
 * forwarded to Apify's pay-per-event API via `Actor.charge({ eventName, count })`.
 * The `apify` SDK is imported lazily so stdio / local users don't pay its load
 * cost. On the Apify platform (`APIFY_IS_AT_HOME`), `initApify()` is called at
 * startup by the entrypoint; elsewhere it runs on the first charge.
 *
 * Billing failures are logged to stderr and never break a tool call.
 */
import type { Actor as ApifyActor } from "apify";

/** Pay-per-event names emitted by this server. Keep in sync with README and Apify pricing config. */
export const BillingEvents = {
  /** One successful search_apps call. */
  SEARCH: "search-apps",
  /** One review returned by get_app_reviews (count = reviews in the response). */
  REVIEW: "review",
  /** One successful review_insights call (flat; no per-review charge). */
  INSIGHTS: "review-insights",
  /** One successful compare_apps call (flat; no per-review or per-app charge). */
  COMPARE: "compare-apps",

  // Google Play (store: "google"). Separate events so Apple pricing is untouched.
  // PROPOSED: these must be added to the Apify pay-per-event config before release.
  /** One successful search_apps call with store="google". */
  PLAY_SEARCH: "play-search",
  /** One Google Play review returned by get_app_reviews (count = reviews in the response). */
  PLAY_REVIEW: "play-review",
  /** One successful review_insights call for a Google Play app (flat). */
  PLAY_INSIGHTS: "play-review-insights",
  /** One successful compare_apps call that includes at least one Google Play app (flat, replaces compare-apps). */
  PLAY_COMPARE: "play-compare-apps",
} as const;

export type BillingEventName = (typeof BillingEvents)[keyof typeof BillingEvents];

let actorPromise: Promise<typeof ApifyActor | null> | null = null;

export function isAtHome(): boolean {
  return process.env.APIFY_IS_AT_HOME !== undefined && process.env.APIFY_IS_AT_HOME !== "";
}

function billingEnabled(): boolean {
  return (process.env.BILLING ?? "").toLowerCase() === "apify";
}

async function loadApifyActor(): Promise<typeof ApifyActor | null> {
  try {
    const { Actor } = await import("apify");
    await Actor.init();
    return Actor;
  } catch (err) {
    console.error(`[apify] failed to initialize the Apify SDK; billing events will be dropped: ${String(err)}`);
    return null;
  }
}

/** Load the Apify SDK and call `Actor.init()`. Idempotent. */
export function initApify(): Promise<typeof ApifyActor | null> {
  actorPromise ??= loadApifyActor();
  return actorPromise;
}

/**
 * Record `count` units of billable event `name`.
 * No-op unless `BILLING=apify`. Never throws.
 */
export async function chargeEvent(name: BillingEventName, count = 1): Promise<void> {
  if (!billingEnabled()) return;
  if (!Number.isFinite(count) || count < 1) return;
  try {
    const actor = await initApify();
    if (!actor) return;
    await actor.charge({ eventName: name, count: Math.floor(count) });
  } catch (err) {
    console.error(`[billing] failed to charge event '${name}' x${count}: ${String(err)}`);
  }
}
