import { GithubRepo } from "@/utils/fetch-repository";
import { getStackMeta } from "@/utils/stackMeta";
import { RepoInfo } from "./RepoInfo";
import { RepoLinks } from "./RepoLinks";

export const RepoCard = ({ repo }: { repo: GithubRepo }) => {
  const langMeta = repo.language ? getStackMeta(repo.language) : null;
  const accentColor =
    langMeta && langMeta.bg !== "transparent" ? langMeta.bg : "transparent";

  return (
    <article
      className="group relative flex items-start gap-3 rounded-lg border border-(--border)/80 bg-(--surface)/90 backdrop-blur-sm px-4 py-3 border-l-2 transition-all duration-200 hover:border-(--border) hover:bg-(--surface-2)/80 hover:-translate-y-px hover:shadow-[0_6px_24px_rgba(0,0,0,0.4)]"
      style={{ borderLeftColor: accentColor }}
    >
      <RepoInfo repo={repo} />
      <RepoLinks repo={repo} />
    </article>
  );
};
