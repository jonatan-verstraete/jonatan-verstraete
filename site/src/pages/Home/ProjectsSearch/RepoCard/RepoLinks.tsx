import { CACHE_INVALIDATION_TIME, OWNER } from "@/config";
import { fetchLatestDmgUrl, fetchPreviewUrl, GithubRepo } from "@/utils/fetch-repository";
import { withLocalCache } from "@/utils/queryClient";
import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { Github, GlobeIcon, Download, LucidePackageCheck } from "lucide-react";
import { PropsWithChildren } from "react";

import npmExists from "@jayf0x/npm-exists";

const queryOpts = {
  staleTime: Infinity,
  gcTime: Infinity,
};

const iconButtonCls = "rounded-full border border-(--accent)/40 p-1.5 text-accent transition-colors hover:border-accent hover:bg-accent-glow flex center";

export const RepoLinks = ({ repo }: { repo: GithubRepo }) => {
  const queryPreview = useQuery<string | null>({
    queryKey: ["repo-preview", repo.name],
    queryFn: () => withLocalCache(`gh:preview:${repo.name}`, CACHE_INVALIDATION_TIME, () => fetchPreviewUrl(OWNER, repo.name)),
    ...queryOpts,
  });

  const queryDMG = useQuery<string | null>({
    queryKey: ["repo-dmg", repo.name],
    queryFn: () => withLocalCache(`gh:dmg:${repo.name}`, CACHE_INVALIDATION_TIME, () => fetchLatestDmgUrl(OWNER, repo.name)),
    ...queryOpts,
  });

  const queryNpmPkg = useQuery<string | false>({
    queryKey: ["npm-badge", repo.name],
    queryFn: async () => npmExists(`@${OWNER}/${repo.name.startsWith("fluid") ? repo.name + "-js" : repo.name}`, { silent: false }),
    ...queryOpts,
  });

  return (
    <div className="flex flex-col">
      <div className="flex flex-row justify-end gap-1.5 pt-0.5 items-center">
        <LinkIcon query={queryNpmPkg} title="Download macOS app">
          <LucidePackageCheck size={15} />
        </LinkIcon>

        <a href={repo.html_url} target="_blank" rel="noreferrer" title="Repository" className={iconButtonCls}>
          <Github size={13} />
        </a>
        {repo.homepage && (
          <a href={repo.homepage} target="_blank" rel="noreferrer" title="Website" className={iconButtonCls}>
            <GlobeIcon size={15} />
          </a>
        )}

        <LinkIcon query={queryDMG} title="Download macOS app">
          <Download size={15} />
        </LinkIcon>
      </div>

      {queryPreview.isLoading ? (
        <div className="mt-1 h-14 w-24 animate-pulse rounded-lg bg-border" />
      ) : queryPreview.data ? (
        <div
          className="w-62.5 h-37.5 transition-opacity duration-300 group-hover:opacity-100 opacity-20 rounded-md"
          style={{
            background: `url(${queryPreview.data}) no-repeat`,
            backgroundSize: "140% auto",
            backgroundPosition: "top left",
          }}
        />
      ) : null}
    </div>
  );
};

const LinkIcon = ({
  query,
  title,
  children,
}: PropsWithChildren<{
  query: UseQueryResult<string | null | false, Error>;
  title: string;
}>) => {
  const { data, isLoading } = query;
  if (isLoading) return <div className="h-7.5 w-7.5 animate-pulse rounded-full bg-border" />;
  if (!data) return null;

  return (
    <a href={data} target="_blank" rel="noreferrer" title={title} className={iconButtonCls}>
      {children}
    </a>
  );
};
