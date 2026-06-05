import { CACHE_INVALIDATION_TIME } from "@/config";
import { GithubRepo, fetchRepoLanguages } from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { Archive, Scale } from "lucide-react";

const queryOpts = {
  staleTime: CACHE_INVALIDATION_TIME,
  gcTime: CACHE_INVALIDATION_TIME,
};

export const RepoInfo = ({ repo }: { repo: GithubRepo }) => {
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["repo-langs", repo.name],
    queryFn: () => withLocalCache(`gh:langs:${repo.name}`, CACHE_INVALIDATION_TIME, () => fetchRepoLanguages(repo.languages_url)),
    ...queryOpts,
  });

  return (
    <div className="min-w-0 flex-1 space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold text-(--text)">{repo.name}</h3>
        {repo.archived && (
          <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/40 bg-amber-500/10 px-1.5 py-0 font-mono text-[10px] text-amber-400">
            <Archive size={9} />
            archived
          </span>
        )}
        {repo.stargazers_count > 0 && <span className="font-mono text-xs text-(--muted)">★ {repo.stargazers_count}</span>}
        {repo.pushed_at && <span className="font-mono text-xs text-(--muted)">· {timeSince(repo.pushed_at)}</span>}
      </div>

      {repo.description && <p className="text-sm leading-snug text-(--muted)">{repo.description}</p>}

      <div className="flex flex-wrap gap-1.5">
        {languages.map((lang) => (
          <StackBadge key={lang} name={lang} size="xs" />
        ))}
        {repo.topics.map((t) => (
          <span key={t} className="rounded-full border border-(--border) px-2 py-0 font-mono text-[10px] text-(--muted)">
            {t}
          </span>
        ))}
      </div>

      {repo.license && (
        <div className="flex items-center gap-1 text-(--muted)">
          <Scale size={10} />
          <span className="font-mono text-[10px]">{repo.license.spdx_id}</span>
        </div>
      )}
    </div>
  );
};

const StackBadge = ({ name, size = "sm" }: { name: string; size?: "sm" | "xs" }) => {
  const m = getStackMeta(name);
  const px = size === "xs" ? "px-1.5 py-0" : "px-2 py-0.5";
  const text = size === "xs" ? "text-[10px]" : "text-xs";
  return (
    <span
      className={`inline-block shrink-0 rounded font-mono font-medium ${px} ${text}`}
      style={{
        background: m.bg === "transparent" ? "var(--overlay-sm)" : m.bg,
        color: m.color,
      }}
    >
      {m.label || name}
    </span>
  );
};

const timeSince = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const m = 60_000,
    h = 60 * m,
    d = 24 * h;
  if (diff < h) return `${Math.max(1, Math.floor(diff / m))}m ago`;
  if (diff < d) return `${Math.floor(diff / h)}h ago`;
  return `${Math.floor(diff / d)}d ago`;
};
