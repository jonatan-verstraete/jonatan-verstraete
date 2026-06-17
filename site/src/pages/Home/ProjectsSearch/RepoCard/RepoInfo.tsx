import { CACHE_INVALIDATION_TIME } from "@/config";
import { GithubRepo, fetchRepoLanguages } from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { Archive } from "lucide-react";

const queryOpts = { staleTime: CACHE_INVALIDATION_TIME, gcTime: CACHE_INVALIDATION_TIME };

export const RepoInfo = ({ repo }: { repo: GithubRepo }) => {
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["repo-langs", repo.name],
    queryFn: () =>
      withLocalCache(`gh:langs:${repo.name}`, CACHE_INVALIDATION_TIME, () =>
        fetchRepoLanguages(repo.languages_url),
      ),
    ...queryOpts,
  });

  return (
    <div className="min-w-0 flex-1 flex flex-col gap-1.5">
      {/* Name row */}
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-base font-semibold text-(--text) tracking-tight leading-none">
          {repo.name}
        </h3>
        {repo.archived && (
          <span className="inline-flex items-center gap-0.5 rounded border border-amber-500/30 bg-amber-500/8 px-1.5 py-px font-mono text-nano text-amber-400/90">
            <Archive size={8} />
            archived
          </span>
        )}
        {repo.stargazers_count >= 5 && (
          <span className="font-mono text-nano text-(--muted)/60 tabular-nums">
            ★ {repo.stargazers_count}
          </span>
        )}
      </div>

      {/* Description */}
      {repo.description && (
        <p className="text-sm leading-relaxed text-(--overlay-a100) line-clamp-2">
          {repo.description}
        </p>
      )}

      {/* Footer: lang badges + topics + date */}
      <div className="flex items-center gap-1 flex-wrap mt-0.5">
        {languages.slice(0, 3).map((lang) => (
          <LangBadge key={lang} name={lang} />
        ))}
        {repo.topics.slice(0, 3).map((t) => (
          <TopicPill key={t} name={t} />
        ))}
        <span className="ml-auto font-mono text-nano text-(--muted)/50 shrink-0 tabular-nums">
          {timeSince(repo.pushed_at)}
        </span>
      </div>
    </div>
  );
};

const LangBadge = ({ name }: { name: string }) => {
  const m = getStackMeta(name);
  return (
    <span
      className="inline-block rounded font-mono text-micro font-medium px-1.5 py-px leading-5 shrink-0"
      style={{
        background: m.bg === "transparent" ? "var(--overlay-sm)" : m.bg,
        color: m.color,
      }}
    >
      {m.label || name}
    </span>
  );
};

const TopicPill = ({ name }: { name: string }) => (
  <span className="rounded border border-(--border)/60 px-1.5 py-px font-mono text-micro text-(--muted) leading-5">
    {name}
  </span>
);

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = 60_000, h = 60 * m, d = 24 * h, w = 7 * d, mo = 30 * d;
  if (diff < h)  return `${Math.max(1, Math.floor(diff / m))}m`;
  if (diff < d)  return `${Math.floor(diff / h)}h`;
  if (diff < w)  return `${Math.floor(diff / d)}d`;
  if (diff < mo) return `${Math.floor(diff / w)}w`;
  return `${Math.floor(diff / mo)}mo`;
};
