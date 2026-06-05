import { devLog } from "@/utils/logger";
import { QueryClient } from "@tanstack/react-query";

const FIVE_HOURS = 5 * 60 * 60 * 1000;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: FIVE_HOURS,
      gcTime: FIVE_HOURS,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

export async function withLocalCache<T>(key: string, ttl: number, fn: () => Promise<T>): Promise<T> {
  try {
    const raw = sessionStorage.getItem(key);
    if (raw) {
      const { data, ts } = JSON.parse(raw) as { data: T; ts: number };
      if (Date.now() - ts < ttl) return data;
    }
  } catch (e) {
    devLog(e);
  }

  const data = await fn();

  try {
    sessionStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }));
  } catch (e) {
    devLog(e);
  }

  return data;
}
