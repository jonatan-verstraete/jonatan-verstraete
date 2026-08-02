/**
 * SVG card generator for the profile README showcase.
 *
 * Everything here renders to a self-contained .svg that GitHub will happily serve
 * through camo: no external fonts, no scripts, no remote refs. Theme switching is a
 * plain `prefers-color-scheme` block inside the file — if a browser ignores it we
 * fall through to the light palette, which is still readable on either GitHub theme.
 *
 * This file is the design surface. Tweak numbers here, run `bun run readme`.
 */

export type Card = {
  title: string;
  tagline: string;
  accent: string;
  language?: string;
  /** 52 weekly commit counts from the GitHub participation API. */
  activity?: number[];
  /** npm weekly downloads, if the project ships a package. */
  downloads?: number;
};

type Size = 'hero' | 'medium' | 'mini';

const BOX: Record<Size, { w: number; h: number; pad: number; title: number; tag: number }> = {
  hero: { w: 860, h: 172, pad: 28, title: 30, tag: 15 },
  medium: { w: 424, h: 156, pad: 24, title: 21, tag: 13.5 },
  mini: { w: 278, h: 74, pad: 18, title: 15, tag: 0 },
};

const FONT = `-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif`;
// ponytail: no font metrics, just an average glyph width per font size. Good enough
// for truncation; if a title ever clips, shorten it in showcase.json.
const CHAR_W = 0.54;

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const clamp = (s: string, px: number, size: number) => {
  const max = Math.floor(px / (size * CHAR_W));
  return s.length <= max ? s : `${s.slice(0, Math.max(0, max - 1)).trimEnd()}…`;
};

const compact = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k` : `${n}`);

/**
 * Raw participation data is 52 weeks with a long dead run before the repo existed,
 * which plots as a flat line and one spike. Drop the dead run, keep the recent half,
 * and smooth so the shape reads as momentum rather than as noise.
 */
function prep(values: number[]): number[] {
  const first = values.findIndex((v) => v > 0);
  if (first < 0) return [];
  // Always keep a 12-week runway so a young repo still gets a curve, not a stub.
  const live = values.slice(Math.min(first, values.length - 12)).slice(-30);
  if (live.length < 4) return [];
  return live.map((_, i) => {
    const win = live.slice(Math.max(0, i - 1), i + 2);
    return win.reduce((a, b) => a + b, 0) / win.length;
  });
}

/** Area + line path for a sparkline in the box (x0…w, y0…y0+h). */
function spark(values: number[], x0: number, w: number, h: number, y0: number) {
  const pts = values.length > 1 ? values : [0, 0];
  const max = Math.max(...pts, 1);
  const step = (w - x0) / (pts.length - 1);
  const xy = pts.map((v, i) => [x0 + i * step, y0 + h - (v / max) * h] as const);
  // Catmull-Rom-ish smoothing via midpoint quadratics — cheap, no control-point math.
  let line = `M${xy[0][0].toFixed(1)},${xy[0][1].toFixed(1)}`;
  for (let i = 1; i < xy.length; i++) {
    const [px, py] = xy[i - 1];
    const [cx, cy] = xy[i];
    line += `Q${px.toFixed(1)},${py.toFixed(1)} ${((px + cx) / 2).toFixed(1)},${((py + cy) / 2).toFixed(1)}`;
  }
  line += `L${xy.at(-1)![0].toFixed(1)},${xy.at(-1)![1].toFixed(1)}`;
  return { line, area: `${line}L${w},${y0 + h}L${x0},${y0 + h}Z` };
}

const LANG_COLOR: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Rust: '#dea584',
  Svelte: '#ff3e00',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  GLSL: '#5686a5',
};

/** Shared palette + type styles. Light values are the defaults; dark is an override.
 * The accent glow is deliberately weaker on light backgrounds — the same alpha that
 * reads as a subtle bloom on #0d1117 turns a white card into pastel mush. */
const styles = (accent: string, w: number, h: number) => `
  <style>
    .bg   { fill: #ffffff; }
    .glow { stop-opacity: 0.10; }
    .fade { stop-opacity: 0.15; }
    .edge { stroke: #d8dee4; }
    .t    { fill: #1f2328; font-weight: 640; }
    .m    { fill: #59636e; }
    .pill { fill: #f1f3f5; stroke: #d8dee4; }
    .pt   { fill: #59636e; font-weight: 600; }
    text  { font-family: ${FONT}; }
    @media (prefers-color-scheme: dark) {
      .bg   { fill: #0d1117; }
      .glow { stop-opacity: 0.30; }
      .fade { stop-opacity: 0.26; }
      .edge { stroke: #30363d; }
      .t    { fill: #e6edf3; }
      .m    { fill: #8b949e; }
      .pill { fill: #161b22; stroke: #30363d; }
      .pt   { fill: #8b949e; }
    }
  </style>
  <defs>
    <radialGradient id="glow" cx="0" cy="0" r="${Math.round(Math.max(h * 1.7, w * 0.34))}" gradientUnits="userSpaceOnUse">
      <stop class="glow" offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop class="fade" offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0"/>
    </linearGradient>
    <linearGradient id="hfade" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0.30" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.62" stop-color="#fff" stop-opacity="1"/>
    </linearGradient>
    <mask id="edgefade"><rect width="${w}" height="${h}" fill="url(#hfade)"/></mask>
  </defs>`;

export function card(c: Card, size: Size): string {
  const { w, h, pad, title, tag } = BOX[size];
  const inner = w - pad * 2;
  const r = size === 'mini' ? 10 : 14;

  const sparkH = size === 'hero' ? 78 : size === 'medium' ? 62 : 36;
  // On the bigger cards the curve starts past the footer text so the two never collide.
  const sparkX = size === 'mini' ? 0 : Math.round(w * 0.42);
  const series = prep(c.activity ?? []);
  const s = series.length ? spark(series, sparkX, w, sparkH, h - sparkH) : null;

  const footY = h - (size === 'hero' ? 26 : size === 'medium' ? 20 : 0);
  const lang = c.language ? LANG_COLOR[c.language] ?? '#8b949e' : null;

  const parts: string[] = [];
  parts.push(`<rect class="bg edge" x="0.5" y="0.5" width="${w - 1}" height="${h - 1}" rx="${r}"/>`);
  parts.push(`<rect x="0" y="0" width="${w}" height="${h}" rx="${r}" fill="url(#glow)"/>`);

  if (s) {
    // The curve starts mid-card on the big sizes; mask its leading edge so it emerges
    // out of the background instead of butting against a hard vertical cut.
    const mask = sparkX ? ' mask="url(#edgefade)"' : '';
    parts.push(`<g clip-path="url(#clip)"${mask}>
    <path d="${s.area}" fill="url(#fade)"/>
    <path d="${s.line}" fill="none" stroke="${c.accent}" stroke-width="1.6" stroke-opacity="0.85" stroke-linecap="round"/>
  </g>`);
  }

  parts.push(
    `<text class="t" x="${pad}" y="${pad + title * 0.82}" font-size="${title}">${esc(clamp(c.title, inner, title))}</text>`,
  );

  if (tag) {
    parts.push(
      `<text class="m" x="${pad}" y="${pad + title * 0.82 + tag * 1.9}" font-size="${tag}">${esc(clamp(c.tagline, inner, tag))}</text>`,
    );
  }

  if (size !== 'mini') {
    let x = pad;
    if (lang) {
      parts.push(`<circle cx="${x + 5}" cy="${footY - 4}" r="5" fill="${lang}"/>`);
      parts.push(
        `<text class="m" x="${x + 17}" y="${footY}" font-size="12.5">${esc(c.language!)}</text>`,
      );
      x += 17 + c.language!.length * 12.5 * CHAR_W + 14;
    }
    if (c.downloads) {
      const label = `${compact(c.downloads)}/wk`;
      const pw = label.length * 12 * CHAR_W + 20;
      parts.push(
        `<rect class="pill" x="${x}" y="${footY - 13}" width="${pw}" height="19" rx="9.5" stroke-width="1"/>`,
      );
      parts.push(
        `<text class="pt" x="${x + 10}" y="${footY}" font-size="12">${esc(label)}</text>`,
      );
    }
  } else if (c.downloads) {
    const label = `${compact(c.downloads)}/wk`;
    parts.push(
      `<text class="m" x="${w - pad}" y="${pad + title * 0.82}" font-size="12" text-anchor="end">${esc(label)}</text>`,
    );
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${esc(c.title)}">
  ${styles(c.accent, w, h)}
  <clipPath id="clip"><rect x="0" y="0" width="${w}" height="${h}" rx="${r}"/></clipPath>
${parts.map((p) => `  ${p}`).join('\n')}
</svg>
`;
}

/** Horizontal bar chart of npm weekly downloads — replaces the old bullet list of badges. */
export function npmChart(pkgs: { name: string; downloads: number }[], accent = '#e8612c'): string {
  const rowH = 30;
  const w = 860;
  const labelW = 300;
  const barW = w - labelW - 90;
  const h = pkgs.length * rowH + 16;
  const max = Math.max(...pkgs.map((p) => p.downloads), 1);

  const rows = pkgs.map((p, i) => {
    const y = 8 + i * rowH;
    const len = Math.max(3, (p.downloads / max) * barW);
    return `  <text class="t" x="0" y="${y + 19}" font-size="13.5" font-weight="500">${esc(clamp(p.name, labelW - 12, 13.5))}</text>
  <rect x="${labelW}" y="${y + 8}" width="${barW}" height="10" rx="5" class="track"/>
  <rect x="${labelW}" y="${y + 8}" width="${len.toFixed(1)}" height="10" rx="5" fill="${accent}" fill-opacity="0.9"/>
  <text class="m" x="${w}" y="${y + 19}" font-size="12.5" text-anchor="end">${compact(p.downloads)}/wk</text>`;
  });

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="npm weekly downloads">
  <style>
    .t { fill: #1f2328; }
    .m { fill: #59636e; }
    .track { fill: #eaeef2; }
    text { font-family: ${FONT}; }
    @media (prefers-color-scheme: dark) {
      .t { fill: #e6edf3; }
      .m { fill: #8b949e; }
      .track { fill: #21262d; }
    }
  </style>
${rows.join('\n')}
</svg>
`;
}
