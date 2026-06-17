import { GithubRepo } from "@/utils/fetch-repository";
import { RepoLinks } from "./RepoLinks";
import { RepoInfo } from "./RepoInfo";

export const RepoCard = ({ repo }: { repo: GithubRepo }) => {
  return (
    <div className="group flex items-start justify-between gap-4 rounded-xl border border-(--border) bg-(--surface) p-4 transition-all duration-200 hover:border-accent/60 hover:-translate-y-px hover:bg-(--surface-2) hover:shadow-[0_0_0_1px_rgba(79,124,255,0.08),0_8px_28px_rgba(79,124,255,0.1)]">
      <RepoInfo repo={repo} />
      <RepoLinks repo={repo} />
    </div>
  );
};
