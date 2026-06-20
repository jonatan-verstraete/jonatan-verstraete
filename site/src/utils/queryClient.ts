import { devLog } from "@/utils/logger";
import axios from "axios";
import { QueryClient } from "@tanstack/react-query";

const CACHE_KEY = "__portfolio_qc__";
export const TTL = 5 * 60 * 60 * 1000; // 5 hours

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: TTL,
      gcTime: TTL,
      retry: (failureCount, error) =>
        failureCount < 1 &&
        !(axios.isAxiosError(error) && (error.response?.status ?? 0) < 500),
      refetchOnWindowFocus: false,
    },
  },
});

// ─── Persistence ─────────────────────────────────────────────────────────────

type CacheEntry = { queryKey: unknown[]; data: unknown };
type StoredCache = { entries: CacheEntry[]; ts: number };

// Restore from localStorage before first render.
export function hydrateCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return;
    const { entries, ts } = JSON.parse(raw) as StoredCache;
    if (Date.now() - ts > TTL) {
      localStorage.removeItem(CACHE_KEY);
      return;
    }
    for (const { queryKey, data } of entries) {
      queryClient.setQueryData(queryKey, data);
    }
    devLog(`[cache] hydrated ${entries.length} entries`);
  } catch {
    localStorage.removeItem(CACHE_KEY);
  }
}

// Carry original fetch timestamp forward so TTL starts from first fetch, not last write.
const cacheOriginTs = (() => {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (raw) {
      const { ts } = JSON.parse(raw) as StoredCache;
      if (Date.now() - ts < TTL) return ts;
    }
  } catch {}
  return Date.now();
})();

// Write the full cache to localStorage on any query update (debounced).
let _persistTimer: ReturnType<typeof setTimeout> | null = null;
queryClient.getQueryCache().subscribe(() => {
  if (_persistTimer) clearTimeout(_persistTimer);
  _persistTimer = setTimeout(() => {
    const entries = queryClient
      .getQueryCache()
      .getAll()
      .filter((q) => q.state.status === "success" && q.state.data !== undefined)
      .map((q) => ({ queryKey: q.queryKey, data: q.state.data }));
    if (!entries.length) return;
    try {
      localStorage.setItem(
        CACHE_KEY,
        JSON.stringify({ entries, ts: cacheOriginTs }),
      );
    } catch (e) {
      devLog("[cache] persist failed:", e);
    }
  }, 300);
});
