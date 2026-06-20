import { OWNER } from "@/config";
import { fetchUserRepos, GithubRepo } from "@/utils/fetch-repository";
import { useIsMobile } from "@/hooks/useDevice";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, PanelLeftOpen } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 380, damping: 36 };
const topN = 21;

const compareFn =
  <T extends keyof GithubRepo>(key: T) =>
  (a: GithubRepo, b: GithubRepo): number =>
    new Date(b[key] as string).getTime() - new Date(a[key] as string).getTime();

type SortKey = "created_at" | "pushed_at";

interface SidebarProps {
  onSelect: (name: string) => void;
  onSort?: (key: SortKey) => void;
}

const LARGE_BREAKPOINT = 1280;

export const Sidebar = ({ onSelect, onSort }: SidebarProps) => {
  const { data: repos = [], isLoading } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });
  const [open, setOpen] = useState(false);
  const [isLarge, setIsLarge] = useState(
    () => window.innerWidth >= LARGE_BREAKPOINT,
  );
  const isMobile = useIsMobile();

  useEffect(() => {
    const mql = window.matchMedia(`(min-width: ${LARGE_BREAKPOINT}px)`);
    const onChange = () => setIsLarge(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!isLoading && !open && !isMobile && !isLarge) {
      setTimeout(() => setOpen(true), 500);
    }
  }, [isLoading, isMobile, isLarge]);

  const sidebarContent = (
    selectHandler: (name: string) => void,
    sortHandler?: (key: SortKey) => void,
  ) =>
    isLoading ? (
      <div className="flex flex-col gap-2 pt-5">
        {Array.from({ length: topN }).map((_, i) => (
          <div
            key={`skeleton-${i}`}
            className="mx-1 w-full h-5 animate-pulse rounded bg-white/20"
            style={{ opacity: 1 - i * 0.12, animationDelay: String(i * 1000) }}
          />
        ))}
      </div>
    ) : (
      <>
        <SidebarSection
          title="Recently Updated"
          repos={repos}
          dateKey="pushed_at"
          onSelect={selectHandler}
          onSort={sortHandler ? () => sortHandler("pushed_at") : undefined}
        />
        <div className="shrink-0 h-px bg-(--border) my-1" />
        <SidebarSection
          title="Recently Created"
          repos={repos}
          dateKey="created_at"
          onSelect={selectHandler}
          onSort={sortHandler ? () => sortHandler("created_at") : undefined}
        />
      </>
    );

  if (isMobile) {
    const mobileSelect = (name: string) => {
      onSelect(name);
      setOpen(false);
    };
    const mobileSort = onSort
      ? (key: SortKey) => {
          onSort(key);
          setOpen(false);
        }
      : undefined;

    return (
      <>
        <button
          type="button"
          aria-label="Recent projects"
          onClick={() => setOpen(true)}
          className="fixed left-3 top-[7rem] z-30 flex h-8 w-8 items-center justify-center rounded-full border border-(--border) bg-(--surface)/90 backdrop-blur text-(--muted) hover:text-(--accent) shadow-lg transition-colors"
        >
          <PanelLeftOpen size={14} />
        </button>

        <AnimatePresence>
          {open && (
            <>
              <motion.div
                key="bd"
                className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setOpen(false)}
              />
              <motion.div
                key="drawer"
                className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-(--bg) border-r border-(--border) flex flex-col pt-4 pb-6 px-3 gap-1"
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={spring}
              >
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="self-end mb-2 p-1 text-(--muted) hover:text-(--accent) transition-colors"
                >
                  <ChevronLeft size={18} />
                </button>
                {sidebarContent(mobileSelect, mobileSort)}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </>
    );
  }

  const sidebarPanel = (
    <div className="flex flex-col h-full min-h-0 pr-3 gap-1">
      {sidebarContent(onSelect, onSort)}
    </div>
  );

  return (
    <div className="relative hidden md:flex shrink-0 self-stretch">
      {isLarge ? (
        <div
          className="flex flex-col min-h-0 overflow-hidden"
          style={{ width: 210 }}
        >
          {sidebarPanel}
        </div>
      ) : (
        <AnimatePresence>
          {open && (
            <motion.div
              key="sidebar"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 210, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={spring}
              className="flex flex-col min-h-0 overflow-hidden"
              style={{ minWidth: 0 }}
            >
              {sidebarPanel}
            </motion.div>
          )}
        </AnimatePresence>
      )}

      {!isLarge && (
        <div className="relative flex flex-col justify-start pt-3">
          <div
            onClick={() => setOpen((v) => !v)}
            className="cursor-pointer transition-all hover:scale-150 flex h-6 w-4 items-center justify-center rounded-r-md border border-l-0 border-(--border) bg-(--surface) text-(--muted) hover:text-(--accent)"
          >
            {open ? <ChevronLeft size={10} /> : <PanelLeftOpen size={20} />}
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarSection = ({
  title,
  repos,
  dateKey,
  onSelect,
  onSort,
}: {
  title: string;
  repos: GithubRepo[];
  dateKey: SortKey;
  onSelect: (name: string) => void;
  onSort?: () => void;
}) => {
  const projects = repos.slice().sort(compareFn(dateKey)).slice(0, topN);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {onSort ? (
        <button
          type="button"
          onClick={onSort}
          className="mb-1.5 shrink-0 text-left font-mono text-nano uppercase tracking-widest text-(--accent) hover:text-(--text) transition-colors duration-150"
        >
          {title}
        </button>
      ) : (
        <span className="mb-1.5 shrink-0 font-mono text-nano uppercase tracking-widest text-(--accent)">
          {title}
        </span>
      )}
      <div className="relative flex-1 min-h-0">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden space-y-px [&::-webkit-scrollbar]:hidden pb-5">
          {projects.map((repo) => (
            <SidebarItem
              key={`sidebar-item-${repo.id}`}
              repo={repo}
              date={repo[dateKey]}
              onClick={() => onSelect(repo.name)}
            />
          ))}
        </div>
        <div className="pointer-events-none absolute bottom-0 inset-x-0 h-12 bg-gradient-to-t from-black/25 to-transparent" />
      </div>
    </div>
  );
};

const timeInits: [number, string][] = [
  [31536000, "year"],
  [2592000, "month"],
  [604800, "week"],
  [86400, "day"],
  [3600, "hour"],
  [60, "min"],
];
const fmt = (iso: string) => {
  const timeAgo = (Date.now() - new Date(iso).getTime()) / 1000;
  const [seconds, unit] = timeInits.find(([time]) => timeAgo / time >= 1) ?? [];

  if (!seconds) {
    return `${Math.floor(timeAgo)} sec`;
  }

  const time = Math.floor(timeAgo / seconds);

  return `${time} ${unit}${time > 1 ? "s" : ""}`;
};

const SidebarItem = ({
  repo,
  date,
  onClick,
}: {
  repo: GithubRepo;
  date: string;
  onClick: () => void;
}) => (
  <button
    type="button"
    className="group flex items-center justify-between w-full gap-1 rounded-md px-1.5 py-[3px] transition-all duration-100 text-(--muted) hover:bg-(--surface) hover:translate-x-0.5 hover:text-(--accent)"
    onClick={onClick}
  >
    <div className="min-w-0 flex-1 truncate text-left font-mono text-mini">
      {repo.name}
    </div>
    <div className="shrink-0 font-mono text-nano text-(--muted)/50 tabular-nums">
      {fmt(date)}
    </div>
  </button>
);
