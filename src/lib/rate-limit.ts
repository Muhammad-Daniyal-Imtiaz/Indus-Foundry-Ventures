export const SEARCH_RATE_LIMIT = {
  maxTokens: 30,
  windowMs: 60000,
};

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();
const MAX_TOKENS = SEARCH_RATE_LIMIT.maxTokens;
const REFILL_WINDOW_MS = SEARCH_RATE_LIMIT.windowMs;
const REFILL_RATE = MAX_TOKENS;

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remaining: number;
  retryAfter?: number;
} {
  const now = Date.now();
  let bucket = buckets.get(identifier);
  if (!bucket) {
    bucket = { tokens: MAX_TOKENS, lastRefill: now };
    buckets.set(identifier, bucket);
  }
  const elapsed = now - bucket.lastRefill;
  const refill = Math.floor((elapsed / REFILL_WINDOW_MS) * REFILL_RATE);
  if (refill > 0) {
    bucket.tokens = Math.min(MAX_TOKENS, bucket.tokens + refill);
    bucket.lastRefill = now;
  }
  if (bucket.tokens <= 0) {
    return {
      allowed: false,
      remaining: 0,
      retryAfter: Math.ceil((REFILL_WINDOW_MS - elapsed) / 1000),
    };
  }
  bucket.tokens -= 1;
  return { allowed: true, remaining: bucket.tokens };
}

export function cleanupBuckets(): void {
  const now = Date.now();
  for (const [id, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > REFILL_WINDOW_MS * 2) {
      buckets.delete(id);
    }
  }
}
