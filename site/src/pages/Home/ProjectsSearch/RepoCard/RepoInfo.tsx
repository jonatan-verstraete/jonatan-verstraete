import { TagChip } from "@/components/TagChip";
import { GithubRepo } from "@/utils/fetch-repository";
import { Archive } from "lucide-react";

export const RepoInfo = ({
  repo,
  languages,
  onTagClick,
}: {
  repo: GithubRepo;
  languages: string[];
  onTagClick?: (name: string) => void;
}) => (
  <div className="min-w-0 flex-1 flex flex-col gap-2">
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

    {/* Footer: lang badges + topics */}
    <div className="flex items-center gap-1.5 flex-wrap">
      {languages.slice(0, 3).map((lang) => (
        <TagChip
          key={lang}
          name={lang}
          onClick={
            onTagClick ? () => onTagClick(lang.toLowerCase()) : undefined
          }
        />
      ))}
      {repo.topics.slice(0, 3).map((t) => (
        <TagChip
          key={t}
          name={t}
          onClick={onTagClick ? () => onTagClick(t.toLowerCase()) : undefined}
        />
      ))}
    </div>
  </div>
);
