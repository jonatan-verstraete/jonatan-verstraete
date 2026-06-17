import { CACHE_INVALIDATION_TIME, OWNER } from "@/config";
import {
  fetchLatestDmgUrl,
  fetchPreviewUrl,
  GithubRepo,
} from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Download, Github, GlobeIcon, LucidePackageCheck } from "lucide-react";
import { PropsWithChildren } from "react";

import npmExists from "@jayf0x/npm-exists";

const queryOpts = { staleTime: Infinity, gcTime: Infinity };

const iconCls =
  "flex items-center justify-center w-6 h-6 rounded border border-(--border)/50 text-(--muted)/60 hover:text-(--accent) hover:border-(--accent)/40 hover:bg-(--accent)/5 transition-all duration-150";

export const RepoLinks = ({ repo }: { repo: GithubRepo }) => {
  const queryPreview = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () =>
      withLocalCache(`gh:preview:${repo.name}`, CACHE_INVALIDATION_TIME, () =>
        fetchPreviewUrl(OWNER, repo.name),
      ),
    ...queryOpts,
  });

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
    <div className="flex flex-col items-end gap-2 shrink-0 self-stretch justify-between">
      {/* Action links */}
      <div className="flex items-center gap-1">
        <AsyncIcon query={queryNpmPkg} title="npm package">
          <LucidePackageCheck size={11} />
        </AsyncIcon>
        <AsyncIcon query={queryDMG} title="Download .dmg">
          <Download size={11} />
        </AsyncIcon>
        {repo.homepage && (
          <a
            href={repo.homepage}
            target="_blank"
            rel="noreferrer"
            title="Website"
            className={iconCls}
          >
            <GlobeIcon size={11} />
          </a>
        )}
        <a
          href={repo.html_url}
          target="_blank"
          rel="noreferrer"
          title="Repository"
          className={iconCls}
        >
          <Github size={11} />
        </a>
      </div>

      {/* Preview thumbnail */}
      {queryPreview.data && (
        <div
          className="w-16 h-10 rounded-sm overflow-hidden opacity-20 group-hover:opacity-60 transition-opacity duration-400 shrink-0"
          style={{
            background: `url(${queryPreview.data}) no-repeat`,
            backgroundSize: "cover",
            backgroundPosition: "top left",
          }}
        />
      )}
    </div>
  );
};

const AsyncIcon = ({
  query,
  title,
  children,
}: PropsWithChildren<{
  query: UseQueryResult<string | null | false, Error>;
  title: string;
}>) => {
  const { data, isLoading } = query;
  if (isLoading)
    return <div className="h-6 w-6 animate-pulse rounded border border-(--border)/40 bg-(--surface)/60" />;
  if (!data) return null;
  return (
    <a
      href={data}
      target="_blank"
      rel="noreferrer"
      title={title}
      className={iconCls}
    >
      {children}
    </a>
  );
};
