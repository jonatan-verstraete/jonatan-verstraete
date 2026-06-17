import { CACHE_INVALIDATION_TIME, OWNER } from "@/config";
import { fetchPreviewUrl, fetchRepoLanguages, GithubRepo } from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { RepoInfo } from "./RepoInfo";
import { RepoLinks } from "./RepoLinks";

const queryOpts = { staleTime: CACHE_INVALIDATION_TIME, gcTime: CACHE_INVALIDATION_TIME };

export const RepoCard = ({
  repo,
  onTagClick,
}: {
  repo: GithubRepo;
  onTagClick?: (name: string) => void;
}) => {
  const { data: languages = [] } = useQuery<string[]>({
    queryKey: ["repo-langs", repo.name],
    queryFn: () =>
      withLocalCache(`gh:langs:${repo.name}`, CACHE_INVALIDATION_TIME, () =>
        fetchRepoLanguages(repo.languages_url),
      ),
    ...queryOpts,
  });

  const { data: previewUrl } = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () =>
      withLocalCache(`gh:preview:${repo.name}`, CACHE_INVALIDATION_TIME, () =>
        fetchPreviewUrl(OWNER, repo.name),
      ),
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const accentColor = (() => {
    for (const lang of languages) {
      const bg = getStackMeta(lang).bg;
      if (bg !== "transparent") return bg;
    }
    if (repo.language) {
      const bg = getStackMeta(repo.language).bg;
      if (bg !== "transparent") return bg;
    }
    return null;
  })();

  const inlineStyle: React.CSSProperties = {
    ...(accentColor ? { borderLeftColor: accentColor } : {}),
    ...(previewUrl
      ? {
          backgroundImage: `linear-gradient(to right, var(--surface) 35%, transparent 65%), url(${previewUrl})`,
          backgroundSize: "cover, cover",
          backgroundPosition: "center, center right",
          backgroundRepeat: "no-repeat, no-repeat",
        }
      : {}),
  };

  return (
    <article
      className="group/card relative flex items-start gap-3 rounded-lg border border-(--border)/80 border-l-2 bg-(--surface)/90 overflow-hidden px-4 py-4 transition-all duration-200 hover:border-(--border) hover:bg-(--surface-2)/80 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
      style={inlineStyle}
    >
      <RepoInfo repo={repo} languages={languages} onTagClick={onTagClick} />
      <RepoLinks repo={repo} />
    </article>
  );
};
