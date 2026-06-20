import { OWNER } from "@/config";
import { fetchLatestDmgUrl, GithubRepo } from "@/utils/fetch-repository";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Download, Github, GlobeIcon, LucidePackageCheck } from "lucide-react";
import { PropsWithChildren } from "react";

const iconCls =
  "group/icon flex items-center justify-center w-7 h-7 rounded border border-(--border)/50 bg-(--surface)/70 hover:border-(--accent)/40 hover:bg-(--accent)/5 transition-all duration-150";

export const RepoLinks = ({
  repo,
  npmUrl,
}: {
  repo: GithubRepo;
  npmUrl?: string;
}) => {
  const queryDMG = useQuery<string | null>({
    queryKey: ["repo-dmg", repo.name],
    queryFn: () => fetchLatestDmgUrl(OWNER, repo.name),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  return (
    <div className="flex flex-col items-end justify-between self-stretch shrink-0">
      {/* Action icons */}
      <div className="flex items-center gap-1">
        {npmUrl && (
          <a
            href={npmUrl}
            target="_blank"
            rel="noreferrer"
            title="npm package"
            className={iconCls}
          >
            <span className="text-[#CB3837] group-hover/icon:text-(--accent) transition-colors duration-150">
              <LucidePackageCheck size={14} />
            </span>
          </a>
        )}
        <AsyncIcon
          query={queryDMG}
          title="Download .dmg"
          colorCls="text-(--muted)/70 group-hover/icon:text-(--accent)"
        >
          <Download size={14} />
        </AsyncIcon>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            title="Website"
            className={iconCls}
          >
            <span className="text-[#4A90D9] group-hover/icon:text-(--accent) transition-colors duration-150">
              <GlobeIcon size={14} />
            </span>
          </a>
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          title="Repository"
          className={iconCls}
        >
          <span className="text-(--muted)/70 group-hover/icon:text-(--accent) transition-colors duration-150">
            <Github size={14} />
          </span>
        </a>
      </div>

      {/* Time stamp — always anchored to bottom-right */}
      <span className="font-mono text-nano text-(--muted)/50 tabular-nums">
        {timeSince(repo.pushed_at)}
      </span>
    </div>
  );
};

const AsyncIcon = ({
  query,
  title,
  colorCls,
  children,
}: PropsWithChildren<{
  query: UseQueryResult<string | null | false, Error>;
  title: string;
  colorCls?: string;
}>) => {
  const { data, isLoading } = query;
  if (isLoading)
    return (
      <div className="h-7 w-7 animate-pulse rounded border border-(--border)/40 bg-(--surface)/60" />
    );
  if (!data) return null;
  return (
    <a
      href={data}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={iconCls}
    >
      <span
        className={`${colorCls ?? "text-(--muted)/70"} transition-colors duration-150`}
      >
        {children}
      </span>
    </a>
  );
};

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = 60_000,
    h = 60 * m,
    d = 24 * h,
    w = 7 * d,
    mo = 30 * d;
  if (diff < h) return `${Math.max(1, Math.floor(diff / m))}m`;
  if (diff < d) return `${Math.floor(diff / h)}h`;
  if (diff < w) return `${Math.floor(diff / d)}d`;
  if (diff < mo) return `${Math.floor(diff / w)}w`;
  return `${Math.floor(diff / mo)}mo`;
};
