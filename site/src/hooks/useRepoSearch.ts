import { useMemo } from "react";
import type { GithubRepo } from "@/utils/fetch-repository";

export type FilterItem = { name: string; count: number };

const TOP_N = 10;

function matches(repo: GithubRepo, q: string): boolean {
  const lower = q.toLowerCase();
  return (
    repo.name.toLowerCase().includes(lower) ||
    (repo.description?.toLowerCase().includes(lower) ?? false) ||
    repo.topics.some((t) => t.toLowerCase().includes(lower)) ||
    (repo.language?.toLowerCase().includes(lower) ?? false)
  );
}

export function useRepoSearch(
  repos: GithubRepo[],
  query: string,
  filters: Set<string>,
) {
  const allFilters = useMemo((): FilterItem[] => {
    const counts = new Map<string, number>();
    for (const repo of repos) {
      if (repo.language) counts.set(repo.language, (counts.get(repo.language) ?? 0) + 1);
      for (const t of repo.topics) counts.set(t, (counts.get(t) ?? 0) + 1);
    }
    return [...counts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, TOP_N)
      .map(([name, count]) => ({ name, count }));
  }, [repos]);

  const results = useMemo(() => {
    const hasQuery = query.trim().length > 0;
    const hasFilters = filters.size > 0;
    if (!hasQuery && !hasFilters) return [];

    return repos.filter((repo) => {
      const queryMatch = hasQuery ? matches(repo, query.trim()) : true;
      const filterMatch = hasFilters
        ? [...filters].some(
            (f) => repo.language === f || repo.topics.includes(f),
          )
        : true;
      return queryMatch && filterMatch;
    });
  }, [repos, query, filters]);

  return { results, allFilters };
}
