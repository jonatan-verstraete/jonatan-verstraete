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

  const langColors = languages
    .slice(0, 3)
    .map((l) => getStackMeta(l).bg)
    .filter((bg) => bg !== "transparent");

  if (langColors.length === 0 && repo.language) {
    const fb = getStackMeta(repo.language).bg;
    if (fb !== "transparent") langColors.push(fb);
  }

  const gradientStyle =
    langColors.length > 0
      ? `linear-gradient(to bottom, ${[...langColors, "transparent"].join(", ")})`
      : null;

  // cover+cover guarantees the image always fills the full card height,
  // so the horizontal gradient overlay never misaligns vertically.
  const bgStyle = previewUrl
    ? {
        backgroundImage: `linear-gradient(to right, var(--surface) 35%, transparent 65%), url(${previewUrl})`,
        backgroundSize: "cover, cover",
        backgroundPosition: "center, center right",
        backgroundRepeat: "no-repeat, no-repeat",
      }
    : undefined;

  return (
    <article
      className="group/card relative flex items-start gap-3 rounded-lg border border-(--border)/80 bg-(--surface)/90 overflow-hidden px-4 py-4 transition-all duration-200 hover:border-(--border) hover:bg-(--surface-2)/80 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
      style={bgStyle}
    >
      {gradientStyle && (
        <div
          className="absolute left-0 top-0 bottom-0 w-[3px]"
          style={{ backgroundImage: gradientStyle }}
        />
      )}
      <RepoInfo repo={repo} languages={languages} onTagClick={onTagClick} />
      <RepoLinks repo={repo} />
    </article>
  );
};
