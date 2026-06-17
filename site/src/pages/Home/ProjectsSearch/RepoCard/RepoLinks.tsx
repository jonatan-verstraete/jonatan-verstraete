import { CACHE_INVALIDATION_TIME, OWNER } from "@/config";
import { fetchLatestDmgUrl, GithubRepo } from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Download, Github, GlobeIcon, LucidePackageCheck } from "lucide-react";
import { PropsWithChildren } from "react";

import npmExists from "@jayf0x/npm-exists";

const queryOpts = { staleTime: Infinity, gcTime: Infinity };

const iconCls =
  "group flex items-center justify-center w-7 h-7 rounded border border-(--border)/50 bg-(--surface)/70 hover:border-(--accent)/40 hover:bg-(--accent)/5 transition-all duration-150";

export const RepoLinks = ({ repo }: { repo: GithubRepo }) => {
  const queryDMG = useQuery<string | null>({
    queryKey: ["repo-dmg", repo.name],
    queryFn: () =>
      withLocalCache(`gh:dmg:${repo.name}`, CACHE_INVALIDATION_TIME, () =>
        fetchLatestDmgUrl(OWNER, repo.name),
      ),
    ...queryOpts,
  });

  const queryNpmPkg = useQuery<string | false>({
    queryKey: ["npm-badge", repo.name],
    queryFn: async () =>
      npmExists(
        `@${OWNER}/${repo.name.startsWith("fluid") ? repo.name + "-js" : repo.name}`,
        { silent: false },
      ),
    ...queryOpts,
  });

  return (
    <div className="flex items-center gap-1 shrink-0 self-start">
      <AsyncIcon query={queryNpmPkg} title="npm package" iconCls="text-[#CB3837] group-hover:text-(--accent)">
        <LucidePackageCheck size={14} />
      </AsyncIcon>
      <AsyncIcon query={queryDMG} title="Download .dmg" iconCls="text-(--muted)/70 group-hover:text-(--accent)">
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
          <span className="text-[#4A90D9] group-hover:text-(--accent) transition-colors duration-150">
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
        <span className="text-(--muted)/70 group-hover:text-(--accent) transition-colors duration-150">
          <Github size={14} />
        </span>
      </a>
    </div>
  );
};

const AsyncIcon = ({
  query,
  title,
  iconCls: colorCls,
  children,
}: PropsWithChildren<{
  query: UseQueryResult<string | null | false, Error>;
  title: string;
  iconCls?: string;
}>) => {
  const { data, isLoading } = query;
  if (isLoading)
    return <div className="h-7 w-7 animate-pulse rounded border border-(--border)/40 bg-(--surface)/60" />;
  if (!data) return null;
  return (
    <a
      href={data}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={iconCls}
    >
      <span className={`${colorCls ?? "text-(--muted)/70"} transition-colors duration-150`}>
        {children}
      </span>
    </a>
  );
};
