export interface SearchResult {
  jobs: any[];
  total: number;
  cursor?: string;
}

export interface SearchParams {
  query?: string;
  filters?: Record<string, string>;
  cursor?: string;
  [key: string]: unknown;
}

/**
 * Invalidate the search cache by calling the Worker's /purge endpoint.
 * Falls back silently if the Worker URL is not configured (local dev).
 */
export async function invalidateSearchCache(): Promise<void> {
  const workerUrl = process.env.NEXT_PUBLIC_SEARCH_WORKER_URL;
  const secret = process.env.NEXTAUTH_SECRET;
  if (!workerUrl || !secret) return;

  try {
    await fetch(`${workerUrl.replace(/\/$/, "")}/purge`, {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}` },
    });
  } catch {
    // non-fatal in local dev
  }
}
