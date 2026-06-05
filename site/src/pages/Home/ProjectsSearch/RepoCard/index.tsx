import { GithubRepo } from "@/utils/fetch-repository";
import { RepoLinks } from "./RepoLinks";
import { RepoInfo } from "./RepoInfo";

export const RepoCard = ({ repo }: { repo: GithubRepo }) => {
  return (
    <div className="group flex items-start justify-between gap-4 rounded-xl border border-border bg-surface p-4 transition-all duration-150 hover:border-accent">
      <RepoInfo repo={repo} />
      <RepoLinks repo={repo} />
    </div>
  );
};
