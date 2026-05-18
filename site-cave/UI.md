# UI Style Guide

`src/index.css` is the single source of truth. A rebrand happens by editing that file — not component code.

## Color tokens

```
--color-primary / --color-primary-muted / --color-primary-glow / --color-primary-border
--color-secondary / --color-secondary-muted / --color-secondary-border

--color-overlay-low / -mid / -high   dark surface backgrounds
--color-ink / -muted / -ghost        text on dark

--color-white-mild    0.10   interactive borders (hover/active)
--color-white-soft    0.22   visible overlays
--color-white-subtle  0.06   resting borders
--color-white-dim     0.05   hairlines, dividers, faint hover bg
--color-white-ghost   0.03   barely-there backgrounds
```

## Typography

```
--text-micro   10px   timestamps, labels, hints, keyboard shortcuts
--text-label   11px   secondary text, project names, mono UI
--text-ui      13px   inputs, buttons
--text-read    15px   body copy (LiveTextTile)
```

Use `font-mono` for all UI chrome (labels, timestamps, keyboard hints). Use `font-sans` for oracle/content text.

## Blur scale

```
--blur-low   18px   widget
--blur-mid   28px   picker popover
--blur-high  40px   sidebar
```

Use `backdrop-blur-low / -mid / -high` — no bracket values.

## Shadows

```
--shadow-overlay   floating panels (picker, tile)
--shadow-sidebar   left sidebar
--shadow-inset     inset rings
--shadow-ring      primary-color focus ring
```

## Z-index

```
--z-tile           30   LiveTextTile
--z-widget         50   OracleWidget
--z-sidebar        60   OracleSidebar
--z-picker-trigger 65   project trigger button
--z-picker         70   ProjectPicker
```

## Rules

- No hardcoded `rgba()` or hex values in components — use tokens.
- No `text-[10px]` — use `text-micro`.
- No `backdrop-blur-[Npx]` — use blur scale tokens.
- No `bg-white/[N]` / `border-white/[N]` — use white overlay tokens.
- Opacity modifiers (`/50`, `/80`) on named tokens are fine for one-off states.
- `glowAmber` / `glowPrimary` keyframes in CSS still reference raw rgba — intentional (animation-tuned, not brand).
