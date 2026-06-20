export type SortKey = "created_at" | "pushed_at" | "name" | "npm";

/** Finds the npm URL for a repo, matching by base package name regardless of scope. */
export function findNpmUrl(
  pkgs: Record<string, string>,
  repoName: string,
): string | undefined {
  return Object.entries(pkgs).find(([pkg]) => {
    const base = pkg.includes("/") ? pkg.split("/")[1] : pkg;
    return base === repoName || base === `${repoName}-js`;
  })?.[1];
}
