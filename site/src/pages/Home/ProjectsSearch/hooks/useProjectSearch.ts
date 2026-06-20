import { OWNER } from "@/config";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import {
  fetchNpmPackages,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { findNpmUrl, type SortKey } from "../types";

export function useProjectSearch() {
  const [query, setQueryRaw] = useState("");
  const [filters, setFilters] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<SortKey | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: repos = [], isLoading } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });

  const { data: npmPackages = {} } = useQuery<Record<string, string>>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const { results, allFilters } = useRepoSearch(repos, query, filters);

  const hasQuery = query.trim().length > 0;
  const hasActiveFilters = filters.size > 0;
  const hasInput = hasQuery || hasActiveFilters;

  const displayResults =
    sort === "npm"
      ? repos.filter((r) => findNpmUrl(npmPackages, r.name))
      : sort && !hasInput
        ? repos.slice().sort((a, b) => {
            if (sort === "name") return a.name.localeCompare(b.name);
            const key = sort as "created_at" | "pushed_at";
            return new Date(b[key]).getTime() - new Date(a[key]).getTime();
          })
        : results;

  const setQuery = (value: string) => {
    setSort(null);
    setQueryRaw(value);
  };

  const toggleFilter = (value: string) => {
    setSort(null);
    setFilters((prev) => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const applySort = (key: SortKey) => {
    setSort(key);
    setQueryRaw("");
    setFilters(new Set());
  };

  const clearQuery = () => {
    setQueryRaw("");
    inputRef.current?.focus();
  };

  const clearFilters = () => setFilters(new Set());

  const clearAll = () => {
    setQueryRaw("");
    setFilters(new Set());
    setSort(null);
    inputRef.current?.focus();
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return {
    query,
    setQuery,
    filters,
    toggleFilter,
    clearFilters,
    sort,
    applySort,
    inputRef,
    isLoading,
    allFilters,
    displayResults,
    hasQuery,
    hasActiveFilters,
    hasInput,
    clearQuery,
    clearAll,
  };
}
