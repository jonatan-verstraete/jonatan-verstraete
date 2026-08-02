/**
 * Regenerates the generated blocks in README.md.
 *
 * The README is a normal, hand-edited file. This script only owns what is between
 * taglify markers (`<!-- SHOWCASE:START -->` … `:END`), plus the SVG cards it writes
 * into assets/cards/. Everything else is yours.
 *
 *   bun run readme            # cached network data (12h)
 *   bun run readme --no-cache # refetch everything
 */

import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { taglWrite } from 'taglify';
import { card, npmChart, type Card } from './cards.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CACHE = join(ROOT, '.cache');
const CARDS = join(ROOT, 'assets/cards');
const TTL_H = process.argv.includes('--no-cache') ? 0 : 12;
const NPM_TOP = 6;

type Project = {
  repo: string;
  title: string;
  tagline: string;
  accent: string;
  npm?: string;
};

const config = JSON.parse(readFileSync(join(ROOT, 'scripts/showcase.json'), 'utf8')) as {
  user: string;
  projects: Project[];
};

/** Cached JSON fetch. Serves a stale file rather than failing the run — a profile
 * README is never worth a red build over a rate limit. */
async function cached<T>(name: string, fetcher: () => Promise<T>): Promise<T> {
  const file = join(CACHE, `${name}.json`);
  const age = (() => {
    try {
      return (Date.now() - statSync(file).mtimeMs) / 3_600_000;
    } catch {
      return Infinity;
    }
  })();

  if (age < TTL_H) return JSON.parse(readFileSync(file, 'utf8')) as T;

  try {
    const data = await fetcher();
    mkdirSync(CACHE, { recursive: true });
    writeFileSync(file, JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    if (age < Infinity) {
      console.warn(`  ! ${name}: ${(err as Error).message} — serving stale cache`);
      return JSON.parse(readFileSync(file, 'utf8')) as T;
    }
    throw err;
  }
}

const gh = (...args: string[]) => execFileSync('gh', args, { encoding: 'utf8' });

async function repoMeta() {
  return cached('repos', async () =>
    JSON.parse(
      gh('repo', 'list', config.user, '--visibility=public', '--limit', '100', '--json', 'name,primaryLanguage'),
    ) as { name: string; primaryLanguage: { name: string } | null }[],
  );
}

/** 52 weekly commit counts. The stats API answers 202 with an empty body while GitHub
 * warms its cache; an empty sparkline is fine, the next run picks it up. */
async function activity(repo: string) {
  return cached(`activity-${repo}`, async () => {
    try {
      return JSON.parse(gh('api', `repos/${config.user}/${repo}/stats/participation`, '--jq', '.all')) as number[];
    } catch {
      return [] as number[];
    }
  });
}

async function npmPackages() {
  return cached('npm', async () => {
    const search = await fetch(
      `https://registry.npmjs.org/-/v1/search?text=maintainer:${config.user}&size=50`,
    ).then((r) => r.json() as Promise<{ objects: { package: { name: string } }[] }>);

    const counted = await Promise.all(
      search.objects.map(async ({ package: p }) => {
        const res = await fetch(`https://api.npmjs.org/downloads/point/last-week/${p.name}`);
        const downloads = res.ok ? ((await res.json()) as { downloads: number }).downloads : 0;
        return { name: p.name, downloads };
      }),
    );
    return counted.sort((a, b) => b.downloads - a.downloads);
  });
}

const img = (p: Project, w: number) =>
  `<a href="https://github.com/${config.user}/${p.repo}" title="${p.tagline}"><img src="./assets/cards/${p.repo}.svg" width="${w}" alt="${p.title} — ${p.tagline}"/></a>`;

async function main() {
  const [repos, npm] = await Promise.all([repoMeta(), npmPackages()]);
  const langOf = new Map(repos.map((r) => [r.name, r.primaryLanguage?.name]));
  const dlOf = new Map(npm.map((p) => [p.name, p.downloads]));

  mkdirSync(CARDS, { recursive: true });

  // 1 hero, 2 medium, the rest as a strip — a deliberate hierarchy beats a uniform table.
  const sizes = ['hero', 'medium', 'medium'] as const;
  for (const [i, p] of config.projects.entries()) {
    const data: Card = {
      title: p.title,
      tagline: p.tagline,
      accent: p.accent,
      language: langOf.get(p.repo),
      activity: await activity(p.repo),
      downloads: p.npm ? dlOf.get(p.npm) : undefined,
    };
    writeFileSync(join(CARDS, `${p.repo}.svg`), card(data, sizes[i] ?? 'mini'));
  }

  const [hero, ...rest] = config.projects;
  const showcase = [
    `<p align="center">${img(hero, 860)}</p>`,
    `<p align="center">${rest.slice(0, 2).map((p) => img(p, 424)).join('\n')}</p>`,
    rest.length > 2 ? `<p align="center">${rest.slice(2).map((p) => img(p, 278)).join('\n')}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n\n');

  const top = npm.slice(0, NPM_TOP);
  writeFileSync(join(ROOT, 'assets/npm.svg'), npmChart(top));

  const changed = taglWrite(join(ROOT, 'README.md'), {
    SHOWCASE: showcase,
    NPM: `<p align="center"><img src="./assets/npm.svg" width="860" alt="npm weekly downloads"/></p>`,
  });

  console.log(
    `cards: ${config.projects.length} · npm: ${top.length} · README ${changed ? 'updated' : 'unchanged'}`,
  );
}

await main();
