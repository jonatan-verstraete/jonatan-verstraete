import { OWNER } from "@/config";
import { useRepoSearch } from "@/hooks/useRepoSearch";
import { fetchNpmPackages, fetchUserRepos, type GithubRepo } from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import { Clock, List, Package, PackageSearch, Search, Sparkles, X } from "lucide-react";
import { ElementType, useEffect, useRef, useState } from "react";
import { FilterRow } from "./FilterRow";
import { RepoCard } from "./RepoCard";
import { Sidebar } from "./Sidebar";

const spring = { type: "spring" as const, stiffness: 500, damping: 40 };
const springGentle = { type: "spring" as const, stiffness: 320, damping: 32 };

type SortKey = "created_at" | "pushed_at" | "name" | "npm";

export const ProjectSection = () => {
  const [query, setQuery] = useState("");
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
      ? repos.filter((r) => npmPackages[`@${OWNER}/${r.name}`] ?? npmPackages[`@${OWNER}/${r.name}-js`])
      : sort && !hasInput
      ? repos.slice().sort((a, b) => {
          if (sort === "name") return a.name.localeCompare(b.name);
          return new Date(b[sort as Exclude<SortKey, "npm" | "name">]).getTime() - new Date(a[sort as Exclude<SortKey, "npm" | "name">]).getTime();
        })
      : results;

  const toggleFilter = (value: string) => {
    setSort(null);
    setFilters((prev) => {
      const next = new Set(prev);
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const clearAll = () => {
    setQuery("");
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

  return (
    <section className="flex flex-col flex-1 min-h-0 px-5 py-4">
      <div className="mx-auto max-w-5xl flex flex-row min-h-0 gap-0 size-full">
        <Sidebar
          repos={repos}
          onSelect={setQuery}
          onSort={(key) => {
            setSort(key);
            setQuery("");
            setFilters(new Set());
          }}
          isLoading={isLoading}
        />

        <div className="flex-1 min-w-0 flex flex-col min-h-0 gap-3 md:pl-4">
          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={springGentle}
            className="relative"
          >
            <Search
              size={14}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-(--muted)"
            />
            <input
              ref={inputRef}
              type="text"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => {
                setSort(null);
                setQuery(e.target.value);
              }}
              className="w-full rounded-lg border border-(--border)/70 bg-(--surface) py-2.5 pl-9 pr-24 text-sm text-(--text) placeholder:text-(--overlay-a100) outline-none transition-all duration-150 focus:border-(--accent)/60 focus:shadow-[0_0_0_3px_rgba(79,124,255,0.08)]"
            />
            <div className="absolute right-3 top-0 h-full flex items-center gap-2">
              <AnimatePresence mode="popLayout">
                {hasInput || sort ? (
                  <motion.div
                    key="meta"
                    initial={{ opacity: 0, x: 4 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 4 }}
                    transition={{ duration: 0.12 }}
                    className="flex items-center gap-2"
                  >
                    <span className="font-mono text-micro text-(--muted) tabular-nums">
                      {displayResults.length}
                    </span>
                    <button
                      type="button"
                      aria-label="Clear all"
                      onClick={clearAll}
                      className="text-(--muted) hover:text-(--accent) transition-colors duration-100 p-0.5 rounded"
                    >
                      <X size={13} />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.12 }}
                    className="pointer-events-none"
                  >
                    <kbd className="font-mono text-nano border border-(--border) rounded px-1 py-0.5 text-(--muted) leading-none">
                      /
                    </kbd>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Filter row */}
          <AnimatePresence>
            {!isLoading && allFilters.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ ...springGentle, delay: 0.06 }}
                className="overflow-hidden"
              >
                <FilterRow
                  items={allFilters}
                  filters={filters}
                  onToggle={toggleFilter}
                  hasActiveFilters={hasActiveFilters}
                  onClearFilters={() => setFilters(new Set())}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Active chips */}
          <AnimatePresence>
            {hasInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={springGentle}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap items-center justify-center gap-2">
                  {hasQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        inputRef.current?.focus();
                      }}
                      className="group inline-flex items-center gap-1 rounded border border-(--border)/70 bg-(--surface) px-2 py-0.5 font-mono text-mini text-(--text) hover:border-(--accent)/50 transition-colors duration-100"
                    >
                      <span className="text-(--muted)/50">"</span>
                      {query.trim()}
                      <span className="text-(--muted)/50">"</span>
                      <X
                        size={9}
                        className="ml-0.5 opacity-40 group-hover:opacity-80 transition-opacity"
                      />
                    </button>
                  )}
                  {[...filters].map((f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => toggleFilter(f)}
                      className="group inline-flex items-center gap-1 rounded border border-(--accent)/60 bg-(--accent)/10 px-2 py-0.5 font-mono text-mini text-(--accent) hover:border-(--accent)/80 transition-colors duration-100"
                    >
                      {f}
                      <X
                        size={9}
                        className="ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
                      />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Results */}
          <div className="flex-1 min-h-0 overflow-y-auto space-y-2 pr-0.5 pt-0.5">
            {isLoading ? (
              <LoadingSkeleton />
            ) : (
              <AnimatePresence mode="popLayout" initial={false}>
                {!hasInput && !sort && (
                  <motion.div
                    key="presets"
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={springGentle}
                  >
                    <PresetCards onSelect={setSort} repos={repos} npmCount={Object.keys(npmPackages).length} />
                  </motion.div>
                )}

                {hasInput && results.length === 0 && (
                  <motion.div
                    key="empty-no-results"
                    layout
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={springGentle}
                  >
                    <EmptyNoResults onClear={clearAll} />
                  </motion.div>
                )}

                {displayResults.map((repo, i) => (
                  <motion.div
                    key={`repo-card-${repo.id}`}
                    layout
                    initial={{ opacity: 0, y: 8, scale: 0.99 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{
                      opacity: 0,
                      scale: 0.98,
                      transition: { duration: 0.1 },
                    }}
                    transition={{ ...spring, delay: i * 0.02 }}
                  >
                    <RepoCard repo={repo} onTagClick={toggleFilter} npmPackages={npmPackages} />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

type Preset = {
  key: SortKey;
  label: string;
  sub: string;
  Icon: ElementType;
  cardCls: string;
  iconCls: string;
  badgeCls: string;
  getCount: (repos: GithubRepo[], npmCount: number) => number;
};

const DAY = 86_400_000;

const ALL_PRESETS: Preset[] = [
  {
    key: "pushed_at",
    label: "Recent Activity",
    sub: "Last active first",
    Icon: Clock,
    cardCls:  "border-[#4f7cff]/20 bg-[#4f7cff]/5  hover:border-[#4f7cff]/50 hover:bg-[#4f7cff]/10 hover:shadow-[0_4px_20px_rgba(79,124,255,0.15)]",
    iconCls:  "text-[#4f7cff]/60 group-hover:text-[#4f7cff]",
    badgeCls: "border-[#4f7cff]/30 bg-[#4f7cff]/10 text-[#4f7cff]/70 group-hover:border-[#4f7cff]/50 group-hover:text-[#4f7cff]",
    getCount: (repos) => repos.filter((r) => Date.now() - new Date(r.pushed_at).getTime() < 30 * DAY).length,
  },
  {
    key: "created_at",
    label: "New",
    sub: "Newest repos first",
    Icon: Sparkles,
    cardCls:  "border-[#a855f7]/20 bg-[#a855f7]/5  hover:border-[#a855f7]/50 hover:bg-[#a855f7]/10 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)]",
    iconCls:  "text-[#a855f7]/60 group-hover:text-[#a855f7]",
    badgeCls: "border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7]/70 group-hover:border-[#a855f7]/50 group-hover:text-[#a855f7]",
    getCount: (repos) => repos.filter((r) => Date.now() - new Date(r.created_at).getTime() < 90 * DAY).length,
  },
  {
    key: "name",
    label: "All Projects",
    sub: "A → Z",
    Icon: List,
    cardCls:  "border-[#34d399]/20 bg-[#34d399]/5  hover:border-[#34d399]/50 hover:bg-[#34d399]/10 hover:shadow-[0_4px_20px_rgba(52,211,153,0.15)]",
    iconCls:  "text-[#34d399]/60 group-hover:text-[#34d399]",
    badgeCls: "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]/70 group-hover:border-[#34d399]/50 group-hover:text-[#34d399]",
    getCount: (repos) => repos.length,
  },
  {
    key: "npm",
    label: "npm Released",
    sub: "Published packages",
    Icon: Package,
    cardCls:  "border-[#CB3837]/20 bg-[#CB3837]/5  hover:border-[#CB3837]/50 hover:bg-[#CB3837]/10 hover:shadow-[0_4px_20px_rgba(203,56,55,0.15)]",
    iconCls:  "text-[#CB3837]/60 group-hover:text-[#CB3837]",
    badgeCls: "border-[#CB3837]/30 bg-[#CB3837]/10 text-[#CB3837]/70 group-hover:border-[#CB3837]/50 group-hover:text-[#CB3837]",
    getCount: (_, npmCount) => npmCount,
  },
];

const PresetCards = ({ onSelect, repos, npmCount }: { onSelect: (key: SortKey) => void; repos: GithubRepo[]; npmCount: number }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
    {ALL_PRESETS.map(({ key, label, sub, Icon, cardCls, iconCls, badgeCls, getCount }) => {
      const count = getCount(repos, npmCount);
      return (
        <button
          key={key}
          type="button"
          onClick={() => onSelect(key)}
          className={`group flex flex-col gap-3 rounded-lg border px-4 py-4 text-left transition-all duration-150 hover:-translate-y-px ${cardCls}`}
        >
          <div className="flex items-center justify-between w-full">
            <Icon size={18} className={`transition-colors duration-150 ${iconCls}`} />
            {count > 0 && (
              <span className={`font-mono text-nano tabular-nums rounded-sm border px-1.5 py-0.5 transition-colors duration-150 ${badgeCls}`}>
                {count}
              </span>
            )}
          </div>
          <div>
            <p className="font-mono text-mini font-medium text-(--text)">{label}</p>
            <p className="font-mono text-micro text-(--muted)/60 mt-0.5">{sub}</p>
          </div>
        </button>
      );
    })}
  </div>
);

const EmptyNoResults = ({ onClear }: { onClear: () => void }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-3 text-(--muted)">
    <PackageSearch size={48} className="opacity-20" />
    <div className="text-center">
      <p className="font-mono text-sm">No matches</p>
      <button
        type="button"
        onClick={onClear}
        className="font-mono text-micro opacity-60 mt-1 hover:text-(--accent) hover:opacity-100 transition-colors"
      >
        clear filters
      </button>
    </div>
  </div>
);

const LoadingSkeleton = () => (
  <div className="space-y-1.5">
    {[56, 72, 48, 64, 80].map((h, i) => (
      <div
        key={`skeleton-${i}`}
        className="rounded-lg border border-(--border)/40 bg-(--surface)/60 overflow-hidden"
        style={{ height: h }}
      >
        <div
          className="h-full w-full"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.03) 50%, transparent 100%)",
            backgroundSize: "200% 100%",
            animation: `shimmer 1.8s ease-in-out infinite`,
            animationDelay: `${i * 0.12}s`,
          }}
        />
      </div>
    ))}
  </div>
);
