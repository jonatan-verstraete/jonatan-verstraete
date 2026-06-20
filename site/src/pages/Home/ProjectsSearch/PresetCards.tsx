import { OWNER } from "@/config";
import {
  fetchNpmPackages,
  fetchUserRepos,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { useQuery } from "@tanstack/react-query";
import { Clock, List, Package, Sparkles } from "lucide-react";
import { ElementType } from "react";
import type { SortKey } from "./types";

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
    cardCls:
      "border-[#4f7cff]/20 bg-[#4f7cff]/5  hover:border-[#4f7cff]/50 hover:bg-[#4f7cff]/10 hover:shadow-[0_4px_20px_rgba(79,124,255,0.15)]",
    iconCls: "text-[#4f7cff]/60 group-hover:text-[#4f7cff]",
    badgeCls:
      "border-[#4f7cff]/30 bg-[#4f7cff]/10 text-[#4f7cff]/70 group-hover:border-[#4f7cff]/50 group-hover:text-[#4f7cff]",
    getCount: (repos) =>
      repos.filter(
        (r) => Date.now() - new Date(r.pushed_at).getTime() < 30 * DAY,
      ).length,
  },
  {
    key: "created_at",
    label: "New",
    sub: "Newest repos first",
    Icon: Sparkles,
    cardCls:
      "border-[#a855f7]/20 bg-[#a855f7]/5  hover:border-[#a855f7]/50 hover:bg-[#a855f7]/10 hover:shadow-[0_4px_20px_rgba(168,85,247,0.15)]",
    iconCls: "text-[#a855f7]/60 group-hover:text-[#a855f7]",
    badgeCls:
      "border-[#a855f7]/30 bg-[#a855f7]/10 text-[#a855f7]/70 group-hover:border-[#a855f7]/50 group-hover:text-[#a855f7]",
    getCount: (repos) =>
      repos.filter(
        (r) => Date.now() - new Date(r.created_at).getTime() < 90 * DAY,
      ).length,
  },
  {
    key: "name",
    label: "All Projects",
    sub: "A → Z",
    Icon: List,
    cardCls:
      "border-[#34d399]/20 bg-[#34d399]/5  hover:border-[#34d399]/50 hover:bg-[#34d399]/10 hover:shadow-[0_4px_20px_rgba(52,211,153,0.15)]",
    iconCls: "text-[#34d399]/60 group-hover:text-[#34d399]",
    badgeCls:
      "border-[#34d399]/30 bg-[#34d399]/10 text-[#34d399]/70 group-hover:border-[#34d399]/50 group-hover:text-[#34d399]",
    getCount: (repos) => repos.length,
  },
  {
    key: "npm",
    label: "npm Released",
    sub: "Published packages",
    Icon: Package,
    cardCls:
      "border-[#CB3837]/20 bg-[#CB3837]/5  hover:border-[#CB3837]/50 hover:bg-[#CB3837]/10 hover:shadow-[0_4px_20px_rgba(203,56,55,0.15)]",
    iconCls: "text-[#CB3837]/60 group-hover:text-[#CB3837]",
    badgeCls:
      "border-[#CB3837]/30 bg-[#CB3837]/10 text-[#CB3837]/70 group-hover:border-[#CB3837]/50 group-hover:text-[#CB3837]",
    getCount: (_, npmCount) => npmCount,
  },
];

export const PresetCards = ({
  onSelect,
}: {
  onSelect: (key: SortKey) => void;
}) => {
  const { data: repos = [] } = useQuery<GithubRepo[]>({
    queryKey: ["repos", OWNER],
    queryFn: () => fetchUserRepos(OWNER),
  });
  const { data: npmPackages = {} } = useQuery<Record<string, string>>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
    gcTime: Infinity,
  });
  const npmCount = Object.keys(npmPackages).length;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
      {ALL_PRESETS.map(
        ({ key, label, sub, Icon, cardCls, iconCls, badgeCls, getCount }) => {
          const count = getCount(repos, npmCount);
          return (
            <button
              key={key}
              type="button"
              onClick={() => onSelect(key)}
              className={`group flex flex-col gap-3 rounded-lg border px-4 py-4 text-left transition-all duration-150 hover:-translate-y-px ${cardCls}`}
            >
              <div className="flex items-center justify-between w-full">
                <Icon
                  size={18}
                  className={`transition-colors duration-150 ${iconCls}`}
                />
                {count > 0 && (
                  <span
                    className={`font-mono text-nano tabular-nums rounded-sm border px-1.5 py-0.5 transition-colors duration-150 ${badgeCls}`}
                  >
                    {count}
                  </span>
                )}
              </div>
              <div>
                <p className="font-mono text-mini font-medium text-(--text)">
                  {label}
                </p>
                <p className="font-mono text-micro text-(--muted)/60 mt-0.5">
                  {sub}
                </p>
              </div>
            </button>
          );
        },
      )}
    </div>
  );
};
