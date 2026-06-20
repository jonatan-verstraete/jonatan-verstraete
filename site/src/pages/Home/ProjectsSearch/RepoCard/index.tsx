import { OWNER } from "@/config";
import {
  fetchNpmPackages,
  fetchPreviewUrl,
  type GithubRepo,
} from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { useQuery } from "@tanstack/react-query";
import { findNpmUrl } from "../types";
import { RepoInfo } from "./RepoInfo";
import { RepoLinks } from "./RepoLinks";

export const RepoCard = ({
  repo,
  onTagClick,
}: {
  repo: GithubRepo;
  onTagClick?: (name: string) => void;
}) => {
  const { data: previewUrl } = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () => fetchPreviewUrl(OWNER, repo.name),
  });

  const npmUrl = useQuery<Record<string, string>, Error, string | undefined>({
    queryKey: ["npm-packages", OWNER],
    queryFn: () => fetchNpmPackages(OWNER),
    staleTime: Infinity,
    gcTime: Infinity,
    select: (pkgs) => findNpmUrl(pkgs, repo.name),
  }).data;

  const bg = repo.language ? getStackMeta(repo.language).bg : "transparent";
  const accentColor = bg !== "transparent" ? bg : null;

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
      <RepoInfo
        repo={repo}
        languages={repo.language ? [repo.language] : []}
        onTagClick={onTagClick}
      />
      <RepoLinks repo={repo} npmUrl={npmUrl} />
    </article>
  );
};
