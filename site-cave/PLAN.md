# Allegory of the Cave — Build Plan

This file is editable. If you find things to resolve in a later stage or find better ways, you can edit this file. Do not use this as a changelog, only as a multi-session TODO.

## Current state

2D canvas POC. Working:

- `src/components/ProjectionCanvas.jsx` — canvas renders hardcoded text (`TITLE`/`DESC` at line 10-13), MediaPipe selfie segmentation shadow mask
- `src/hooks/useCamera.js` — webcam capture
- `src/hooks/useAnalyze.js` — polls every 3s, POSTs base64 to `http://127.0.0.1:8042/analyze`, maintains history array
  - ⚠ file exports `useVision` but `App.jsx` imports as `useAnalyze` — broken alias, fix in Stage 1
- `src/components/VisionPanel.jsx` — bottom panel, typewriter via `react-type-animation`
- `api/main.py` — FastAPI + ollama = POST `/analyze` takes `{image: base64, history: string[], think?: boolean}`

Stack: Vite + React + @tanstack/react-query + axios. Run with `bun`.

## Stage 1 — Housekeeping + Three.js scene foundation ✅

**Goal:** replace 2D canvas with a Three.js scene that reproduces current visuals.

Tasks:

- ✅ swap raw canvas logic (draw, image capture...) with optimized ThreeJS functions
- ✅ `captureFrame` uses `preserveDrawingBuffer: true` on the R3F Canvas renderer
  - ⚠️ **TODO (Stage 2+):** `captureFrame` currently captures the full user perspective. We want a second camera facing the wall to capture only the projected image (not the user's viewpoint). Add an off-screen render target with a wall-facing OrthographicCamera and render to it before `toBlob`.
- ✅ Create `src/components/CaveScene.jsx` — R3F Canvas replacing `ProjectionCanvas`
  - ✅ White plane mesh as cave wall with scale driven by `viewport`
  - ✅ `CanvasTexture` built from an offscreen 2D canvas (same text render logic)
  - ✅ Silhouette mask overlay as a second transparent mesh, mirrored via `texture.repeat.set(-1,1)`
  - ✅ Expose same `captureFrame()` imperative handle — `App.jsx` / `useAnalyze` unchanged
- ✅ Fixed broken `useVision`/`useAnalyze` alias (was already correct in current files)

**Done when:** visually identical to current POC but running inside R3F.

## Stage 2 — Cave atmosphere (lighting + assets)

**Goal:** make it look like a real cave with projected light.

Tasks:

- Add a `SpotLight` with `map = CanvasTexture` (gobo / light cookie) — text becomes actual projected light, not a texture on a plane
- Replace flat plane with a GLB rocky cave wall asset in public/wall.glb
  - R3F: `useGLTF` + `meshStandardMaterial`
  - this is a rock formation and will need user review on positioning
- Post-processing: `@react-three/postprocessing` — `GodRays` effect for volumetric light rays
- Add `Points` dust particle system (slow float, subtle)
- Adjust camera: slight perspective lean, fixed position
- Add leva controls for user to refine scene positioning, lighting... etc.

**Done when:** scene looks atmospheric, shadows read as cave light.

## Stage 3 — Refine current state

Tasks:

- `./src/scene/Dust.jsx` needs rewrite to be like fire sparks that come and go.
  - Currently is just 1 init and no control over reborn
  - Use instancing and upgrade performance
- `./src/scene/SceneContent.jsx`
  - Some controls will allocate too much memory and freeze the browser accumulating 150gb or memory. This is likely because of the `EffectComposer`. Double check there are no obvious issues. For example, if the bloom is too high the browser crashes. Maybe we could add a limit or some way to prevent this. Double check if we can do anything or leave as is.
  - extract default values into a general config. Leva controls are additional, so that if we remove leva, the flow is exactly the same
  - add a black plane as floor
- `./src/scene/SceneContent.jsx` + `VideoShadow.jsx`
  - shadow effect is not being projected on the wall and should be in exactly the same fashion as the text.
  - create a wrapper component that positions both the text, video and possible other elements so that they all project in the same perspective

**Done when:** scene and code run smooth are are scalable and ready for Stage 4.

## Stage 4 — Refine fireplace

**Goal:** Have reliable and realistic projected shadows - part 1

Tasks:

- add the or or fire light thats more bright than the current light.
- Create a shader for the main lighting using a flame like shader at `./.keep/flame.shader`. The goal is that this is a shader for the main light source, so that the light does not feel like a projector but as from a real fire. So this shader should somewhat influence the shape of the light.
- all components in `./src/scene/projected/components/*.jsx` should all either have a custom or shader shader to give it a shadow like feel. This shader does not need to be perfect, but it does need to apply. You could use the shader from `./src/scene/projected/components/VideoCam.jsx` as example.

**Done when:** flames + lighting are realistic.

## Stage 5

All deps already installed: `framer-motion`, `jotai`, `react-draggable`, `lucide-react`, `tailwindcss`.

Style guide (applies to 5b + 5c):

- No hard borders. Smooth shadows, subtle gradients, glass-like surfaces.
- Hover states: gradient outline masks, not solid borders.
- Advanced but efficient — no 3D CSS transforms, no heavy repaints.
- Tailwind utility-first; CSS vars for brand tokens.

### Stage 5a — Foundation & Store ✅

**Goal:** wire up the shared state layer and page-entry animation before any UI is built.

Tasks:

- Verify Tailwind v4 config: check `@theme` block in CSS, confirm CSS vars (`--color-*`, spacing) are present and usable as Tailwind utilities. Fix any missing setup.
- Define jotai atoms in `src/store/cave.js`:
  - `historyAtom`: array of `{ id, imageBlob: Blob | null, description: string, timestamp }`, max 100 items, oldest evicted first.
  - `sidebarOpenAtom`: boolean, default `false`.
- Wire setters:
  - `useAnalyze.js`: on successful response, push `{ description, imageBlob: null, timestamp }` to `historyAtom`. Keep `MAX_HIS = 5` rolling window for API calls untouched.
  - `src/scene/index.jsx`: when `captureFrame()` resolves, update the latest history entry's `imageBlob` from the base64 JPEG. Convert base64 → `Blob` via `fetch(dataUri).then(r => r.blob())`. On eviction (>100 entries) revoke the outgoing `URL.createObjectURL`.

**Done when:** store populates correctly, page bounces in on load, old VisionPanel.jsx kept but unused (remove in 5b).

### Stage 5b — Widget + Sidebar ✅

**Goal:** collapsible oracle sidebar and its trigger widget.

Depends on: Stage 5a (jotai store, atoms defined).

Tasks — Widget (`src/components/OracleWidget.jsx`):

- Draggable via `react-draggable`, default position: bottom-right (`right: 24px, bottom: 24px`).
- Round button, ~56px. Glows with a pulsing `box-shadow` animation (amber/orange, 2s ease-in-out infinite). On active (sidebar open): glow color shifts to white.
- Icon from `lucide-react` (placeholder: `Eye` — user swaps later).
- `z-index: 50`, sits below sidebar (`z-index: 60`). Clicking toggles `sidebarOpenAtom`.

Tasks — Sidebar (`src/components/OracleSidebar.jsx`):

- Overlays canvas, does not resize it. Fixed right, full height. `z-index: 60`.
- Width: `300px`. Background: `rgba(0,0,0,0.85)` with `backdrop-filter: blur(12px)`.
- Right edge: black gradient fade (`linear-gradient(to right, transparent, black)`) ~60px wide on the outer edge so it blends into the void.
- `framer-motion`: `AnimatePresence` + `motion.div` sliding in from right (`x: 300 → 0`), spring easing.
- Click-outside to close: `useEffect` with `mousedown` listener that checks `contains`.
- History list: renders last 100 items from `historyAtom` in reverse (newest first). Each row: thumbnail (from `URL.createObjectURL(imageBlob)`) left + description text right. Rows use CSS `object-URL` and revoke on unmount.
- Remove `VisionPanel.jsx` and all its imports once sidebar is wired.

**Done when:** sidebar slides in/out, widget glows, history rows populate.

### Stage 5c — Live Text Tile ✅

**Goal:** floating description display on the left side of the screen.

Depends on: Stage 5a (historyAtom).

Tasks — LiveTextTile (`src/components/LiveTextTile.jsx`):

- Draggable via `react-draggable`, default position: `left: 24px, top: 50%` (vertically centered).
- Width: ~`20vw`, min `180px`. `backdrop-filter: blur(10px)`, background `rgba(255,255,255,0.06)`, no border (subtle `box-shadow` only).
- Displays the `description` from the latest `historyAtom` entry.
- Retypes on change: use `react-type-animation` (already installed) keyed on entry `id` so it restarts the typewriter on new content. Do not retype on mount if no content yet.
- Fade in/out with `framer-motion` `AnimatePresence` when content changes.

**Done when:** tile reacts to new oracle responses, drags freely, looks glass-like.

## Stage 6 — GitHub project integration ✅

**Goal:** swap hardcoded `TITLE`/`DESC` for real GitHub project data.

Reference implementation: `/Users/me/Documents/GitHub/jonatan-verstraete/site/src/pages/Home/ProjectsSearch` — port search/select logic from there.

Tasks:

- ✅ Static project array in `src/data/projects.js` (5 fallback entries)
- ✅ `selectedProjectAtom` + `pickerOpenAtom` added to `src/store/cave.js`
- ✅ `ProjectedSurface/index.jsx` reads `selectedProjectAtom` → passes title/description to `ProjectText`
- ✅ `ProjectText.jsx` glitch/dissolve transition: `uPrev`/`uT` uniforms, scan-line tears + chromatic aberration
- ✅ `useAnalyze.js` passes `project` field (`name: description`) in POST body
- ✅ `src/components/ProjectPicker.jsx` — floating dark panel, search, arrow-key nav, enter/esc
- ✅ `App.jsx` — bottom-center trigger button showing current project name, mounts `<ProjectPicker />`
- ✅ `.env.example` with `VITE_GITHUB_USER`; GitHub API wired via `fetchProjects()` when env var set

**Done when:** user can pick any project and the cave responds to it.

## Stage 7 — Advanced shadow effect ✅

**Goal:** Have reliable and realistic projected shadows - part 2

Implemented:

- ✅ **B. Projection blur** — separable 5-tap Gaussian ping-pong (H→V) at 1024×512 before gobo is fed to spotlight. Makes projection scatter like light on rough stone.
- ✅ **E. Temporal accumulation / ghost trails** — ping-pong accumulation buffers at 2048×1024. `mix(current, prev, uDecay)` — shadows and content linger and fade. `accumDecay` leva slider (0–0.97).
- ✅ **G. Spotlight color temperature animation** — multi-frequency sine flicker oscillates spotlight color between warm amber and slightly cooler, simulating fire flicker.
- ✅ **H. Shadow sharpness leva controls** — `shadowThreshold` and `shadowSoftness` exposed in Shadow leva folder, wired through to `VideoCam.jsx` uniforms.
- ✅ **A. Normal map suppression** — wall GLB traversal sets `normalScale(0.35, 0.35)` and `roughness=0.65` so projected text/shadow reads cleanly on the craggy surface.

## Stage 8 — UI hardening & performance

**Goal:** make the frontend production-ready — fast, polished, and fully wired — before backend features land in Stage 9.

### Stage 8a — Prep ✅

**Goal:** Make rebrand configurable and clean.

Check current UI and check for inconsistencies and resolve these. These could be colors, border, spacing...
The task is to enhance coherence and balance creativity. Your task will likely involve changing Tailwind config for the better. Your side quest is to make sure that other rebrands can happen smooth and mostly by simply changing tailwind config, rather than inline values.
You can change config, css, tailwind, code , structure... this is a big feature but needs to happen before anything else.

Research, verify, improve, update configs...etc. Create a file UI.md, about styles or code rules, but don't bloat it as most tasks are not React UI related in this project.

Optional bonus: You could even put ThreeJS vars inside the tailwind config, so that this config (or css file) is the source of truth for a lot of styling.

### Stage 8b — Sidebar consolidation ✅

**Goal:** consolidate all UI controls into the existing sidebar. Establish final layout for Stage 9 features. Non-functional slots (AI status, history controls) can render as disabled placeholders. A general rebrand would be a nice extra.

Sidebar layout top-to-bottom:

```
AI Status widget (placeholder — wired in Stage 9b)
        ↓
Project search input + results (shared component)
        ↓
History controls (placeholder — wired in Stage 9d)
        ↓
History list
```

#### Project search (shared component)

Extract project search/select logic from [`ProjectPicker.jsx`](./src/components/ProjectPicker.jsx) into a new shared `ProjectSearch` component. Both the existing floating picker and the new sidebar slot use it. Keep the shared component layout-agnostic: no hardcoded background colors or fixed widths — callers provide those. The sidebar variant renders inline; the picker variant keeps its current floating panel wrapper.

#### AI Status placeholder

Render a static `"Oracle: idle"` badge at the top of the sidebar. Mark it clearly as a placeholder. Real polling is wired in Stage 9b.

#### History controls placeholder

Render disabled buttons for: **Clear history**, **Disable shadow memory**, **Share memory**. Tooltips can note "coming in Stage 9". Wired in Stage 9d.

**Done when:** sidebar is the single control surface, project search is a shared component, placeholder slots are visible and correctly positioned.

### Stage 8c — Resizable ✅

**Goal:** Make certain objects resizable.

Use package `react-resizable-panels` (already installed) to make the following items resizable:

- Sidebar must be resizable with min size it's content and max-size something reasonable. You could optionally make a group and add a gradient overlay on the other side as overlay.
- oracle popover needs to be resizable on all 4 sides.
- project picker popover size all 4 sides.

For each make sure that:

- there are reasonable limits to the size. This is meant for readability.
- all configs are stored in localStorage
- There is a button in the sidebar with "Clear Sizes" which clears the local storage

**Done when:** Chosen items behave the same, but are resizable.

### Stage 8d — Raylast like Project search panel ✅

**Goal:** Turn current "Project Select" into a Raycast like experience.

> note: Project search in sidebar works the same way but not floating.

Task:
- change popover to be central on the screen
- its a floating search bar with some suggestions like: some commands, possibly even a last search
- has debounce for search queries and smooth animations
- can open the search input also with hotkey 'space' - if there is not input focussed, otherwise the hotkey is not active
- a search executed by typing Enter
- The search is autocompleted by matching commands and tags.
- tags (blue) and commands (red) or just text (white) query have different colors or maybe small border like a pill.

**Autocomplete**:

- shows the command or tag that fuzzy match
- the suggested commands is grayed out but the outlie or border of the possible cell or command that's being autocompleted also shows. So that the user can see clearly commands or

**Commands**:

- Commands are just predefined structured search queries, but in simple form.
- You can type commands and again submit with enter. Examples:
  - `list`: shows simply all project
  - `recent`: shows maybe top 10 recent project or sorts all by recent
  - `open-sidebar`: opens sidebar (need store trigger)
  - `set-user $name`: updated the Github user to search projects from
  - `theater`: goes into theater mode.
  - `exit-theater`: exists theater mode.
  - ... other.
- these are meant as extra, so just get some working, but can refine later.
- commands can simply be created now and if they do not contain a functionality yet, simply add a null value to make sure they dont show disabled ones in the search results. Like theater mode is still a WIP, so the keys can already be added.

**Done when:** Raycast like UX. 

### Stage 8e — Three Optimization ✅

GLB loading pipeline:

```
PNG/JPG textures
        ↓
convert textures to KTX2
        ↓
embed/use them inside GLTF/GLB
        ↓
load GLB normally with useGLTF()
```

- Enable WebGPU where possible.
- Optimize bundle size.
- Optimize page load and preloads.
- White fade while scene is loading.
- Replace `import * as THREE from "three"` with individual imports for tree shaking.
- Use `KTX2/WebP` or Draco loader for textures and assets.
- Create reusable functions/components/hooks for loading so that future assets can reuse the same logic

**Done when:** Lighthouse perf score improved, scene loads with fade, bundle is tree-shaken.

### Stage 8f — Anamorphic Portal: Render-to-Texture Foundation

**Goal:** establish hidden illusion scene + render target pipeline before any parallax logic is added.

Tasks:

- Create a hidden offscreen scene (`portalScene`) — separate from the main cave scene.
  - Contents: floating particles, soft fog plane, exaggerated-perspective geometry. Monochrome palette. No lighting complexity — this is the "depth world" seen behind the wall.
  - Scene never appears in main render; it only feeds the RTT.
- Add a `WebGLRenderTarget` (`portalTarget`) — single target, no post stack, mobile-safe at reduced resolution (e.g. `512×512` default, configurable).
- Apply `portalTarget.texture` as the `map` on the rocky wall material (replacing or layering over the existing wall texture). Use a `ShaderMaterial` so UV manipulation is possible in Stage 8g.
- Render `portalScene` each frame before the main scene render (use `useFrame` priority or `gl.render` pre-pass).

**Done when:** rocky wall displays the hidden portal scene via render texture. No parallax yet — just the pipe working.

---

### Stage 8g — Depth Echo Projection

**Goal:** add the parallax lag that creates perceived depth — the core illusion.

Depends on: Stage 8f (portal RTT pipeline active).

Tasks:

- Track camera yaw delta each frame (`useFrame`). Store `smoothedOffset` in a ref.
  ```ts
  targetOffset = cameraYaw * 0.15
  smoothedOffset += (targetOffset - smoothedOffset) * 0.08
  ```
- Pass `smoothedOffset` as a uniform (`uParallax`) to the wall `ShaderMaterial`.
- In the fragment shader, offset the portal UV before sampling:
  ```glsl
  vec2 uv = vUv;
  uv.x += uParallax;
  // bind fake depth to physical wall structure
  uv += vNormal.xy * 0.03;
  vec4 portalColor = texture2D(uPortalMap, uv);
  ```
  - `vNormal` must be passed from the vertex shader in world space.
  - Projection direction: side-only (offset on X axis only — never Y).
  - Grazing angle is what sells the effect. Never front-on.
- Add optional bounce-overshoot mode (ref-stored `velocity`):
  ```ts
  velocity += (target - current) * tension
  velocity *= damping
  current += velocity
  ```
  Toggle between simple lerp and overshoot via `enableOvershoot` uniform/config.

**Critical:** do NOT lock the projection 1:1 to camera. Perfect lock = screen. Slight lag = volume. If it looks like a projector, increase lag (`lagAmount`) and reduce `projectionSharpness`.

**Done when:** slow horizontal camera rotation makes the wall feel spatial — projection detaches from surface, depth "breathes", illusion collapses naturally at extreme angles.

---

### Stage 8h — Depth Echo: Visual Polish & Settings

**Goal:** wire the full settings system, refine visual style, and validate the illusion holds.

Depends on: Stage 8g (parallax working).

**Settings** — add to Leva (and extract defaults to scene config, consistent with Stage 8a pattern):

Toggle:
- `enableDepthEcho` — master on/off for the entire effect

Theme params:
- `lagAmount` — multiplier on `smoothedOffset` lerp rate (default `0.08`)
- `projectionSharpness` — blur/sharpen the RTT before applying (can use a simple 3-tap kernel in shader)
- `rockDistortion` — weight of `normal.xy * 0.03` term
- `fogDensity` — fog plane opacity in the hidden scene
- `depthExaggeration` — scales `cameraYaw * 0.15` factor
- `ghostTrail` — blend factor between current and previous portal frame (creates smear/trail)
- `monochrome` — toggle between monochrome depth and a palette tint on the portal scene

**Visual style checklist:**
- Monochrome depth (default on)
- Soft fog layer in portal scene
- Floating particles (slow drift, low count — reuse or reference `Dust.jsx`)
- Exaggerated perspective on portal geometry
- High-contrast cavities (boost contrast in shader)
- Slow drifting motion in portal scene (offset portal camera or animate geometry)

**Failure-mode checklist (manual QA):**
- If wall looks like a video screen → increase `lagAmount`, increase `depthExaggeration`
- If projection feels locked → lower `projectionSharpness`, raise `lagAmount`
- If effect disappears at slight angles → reduce `rockDistortion`

**Done when:** full settings panel live, visual style matches spec (ancient holographic stone feel), illusion passes manual rotation QA.

---

## Stage 9 — Features

### Stage 9a — Communication Mode

**Goal:** shift the oracle from passive observer to active communicant when the user enables their camera.

Camera-off (default): the oracle watches and interprets. It narrates the cave, reads the shadows, speaks about what it sees as if the humans don't know it's watching. Detached, poetic, eerie.

Camera-on: the oracle knows you can hear it. It switches to direct address. It has things it wants to tell you. It interprets your body as a language it is trying to decode — not mockingly, but earnestly, like first contact. The cave bible contains what it believes gestures mean; it reads your shadow against that.

**Implementation:**

- New POST body field: `communicationMode: bool`. Defaults to `false`. Set to `true` when webcam is active (`isActive` in `useAnalyze.js`).
- Backend: if `communicationMode`, use a different system prompt wrapper that frames the oracle as communicant rather than observer. The bible is still injected — same world, different stance. Example framing:

  _Observer mode:_ "You watch the wall. A shape moves. You have seen shapes like this before..."

  _Communicant mode:_ "You are trying to reach them. They have shown you their arms again. Last time arms meant..."

- The oracle still outputs one short paragraph. The tone shifts, not the format.
- Frontend: `OracleWidget` (Stage 5b) gets a subtle indicator when communication mode is active — e.g. glow color shifts. No other UI change needed.

**Done when:** camera-on/off toggles oracle persona, bible context is shared between both modes, tone difference is clearly felt.

### Stage 9b — AI Status

**Goal:** expose real-time oracle availability so the user knows when the model is busy, queued, or idle — not just waiting in silence.

There is only one model at a time. When it's thinking, it is genuinely unavailable. This constraint is part of the experience, not a bug. The status should reflect it.

**Backend (`api/main.py`):**

- New `GET /status` endpoint. Returns a JSON body indicating current model state:
  - `{ "status": "idle" }` — model ready
  - `{ "status": "busy", "queue": 0 }` — model currently generating
  - `{ "status": "queued", "queue": 2, "eta_seconds": 30 }` — request(s) ahead in line
- Track state with a module-level flag/counter updated around each ollama call. No external queue library needed — the model is single-threaded by design.

**Frontend (`src/`):**

- Add `oracleStatusAtom` to `src/store/cave.js` — stores the latest status object.
- New `useOracleStatus.js` hook: polls `GET /status` every 5 s via `setInterval`. Updates `oracleStatusAtom`. Stops polling when tab is hidden (`visibilitychange`).
- Wire the AI Status placeholder in `OracleSidebar` (Stage 8b) to render live from `oracleStatusAtom`: amber dot + text for idle, pulsing red for busy, queue count for queued.

**Done when:** sidebar status updates in real time, correctly reflects busy/idle/queued, polling pauses when tab hidden.

### Stage 9c — Shadow Memory

**Goal:** give the oracle a persistent, cross-session memory so it builds a mythology of the cave over time — rather than guessing its world fresh each call.

This is the allegory made literal: the AI inhabits a constructed reality it never questions. Returning users get a model that "recognises" recurring patterns. First-time visitors encounter a cave that already has a history.

**Model context budget:** Qwen3.5 9B has a 262k token context window. Use it. The cave bible + compressed real memories + current session history should comfortably fit within ~80k tokens, leaving the rest for generation headroom. This is the payoff — most models at this parameter count never get fed this much narrative. The oracle becomes genuinely deep.

**Cave Bible (`api/bible.md`):**
A hand-authored mythology document, ~10–30k tokens. Written in second-person present tense as if the oracle is recalling its own knowledge. Contents:

- The laws of the cave (what gestures mean, what shapes are sacred)
- Recurring figures and what became of them
- Prophecies that may or may not have been fulfilled
- The nature of the shadows (they are not people, they are messages)
- False histories that feel real

This file is injected verbatim at the top of every system prompt, before any memory entries. It is never compressed. Authoring this document is a creative task done outside of code — the spec is: write it dense, write it specific, make the oracle feel ancient.

**Architecture — backend (`api/`):**

Storage: SQLite (`api/memory.db`), single table:

```sql
CREATE TABLE memories (
  id INTEGER PRIMARY KEY,
  text TEXT NOT NULL,
  session_id TEXT,
  timestamp INTEGER
);
```

Compression: when `memories` exceeds 80 rows, run a summarization prompt through the existing ollama model — produce ~8 compressed entries, delete the originals, insert the summaries (`session_id = '__compressed__'`). Keeps accumulated entries lean. Bible is never touched.

Responsive injection: after each model response, run a lightweight regex/fuzzy scan of the output. If it matches a trigger pattern (e.g. mentions a specific figure, shape, or ritual), prepend an additional passage from the bible on the _next_ call — not as a game mechanic, but as passive narrative deepening. The cave reacts to what the oracle notices. Triggers and their injected passages are defined in a simple config dict in `api/main.py`.

Injection order at each `/analyze` call:

```
[cave bible]
[responsive passage, if triggered last call]
[compressed memory entries, newest first, up to token budget]
[current session history, MAX_HIS=5]
[current prompt]
```

**New POST body field:** add `fresh: bool` — if `true`, skip memory + responsive injection (bible still injected). Wired to the history controls toggle in Stage 9d.

**Frontend (`src/`):**

- Pass `fresh` through `useAnalyze.js` to POST body, sourced from `historyControlsAtom` (Stage 9d).

**Done when:** oracle has a bible, accumulates real memories, responsive passages fire on trigger matches, fresh-mode works.

### Stage 9d — History Controls

**Goal:** give the user agency over the oracle's memory — clear it, suppress it, or share it.

These controls live in the sidebar history controls slot established in Stage 8b.

**Controls:**

- **Clear history** — wipes `historyAtom` in the frontend store and POSTs `DELETE /memory` to the backend, clearing `memories` rows for the current `session_id`. The oracle resets as if the user is new.
- **Disable shadow memory** (`fresh` toggle) — when enabled, sets `fresh: true` on all subsequent `/analyze` calls (see Stage 9c). The oracle speaks without its accumulated past. Toggle state lives in a `freshModeAtom` in `src/store/cave.js`.
- **Share memory** (opt-in) — an opt-in flag that marks session memories as `session_id = '__shared__'` on the backend, making them eligible for the nightly compression pass that feeds the general pool. This is purely an opt-in — no memory is shared without explicit toggle. UI: a checkbox with a short description ("Let your shadow join the collective memory. Crunched overnight.").

**Backend (`api/main.py`):**

- `DELETE /memory` — accepts `{ session_id: string }`, deletes matching rows from `memories`.
- `POST /memory/share` — re-tags rows for the given session as `__shared__`.

**Done when:** all three controls work end-to-end, fresh toggle suppresses memory injection, clear wipes both local and backend state.

### Stage 9e — username is param in the URL

**Goal:** App and url connect 

- Currently user is defined with `const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;`. Remove the ENV and simple make this a query param in the URL
- do not add routing. Simply take the optional param from the URL to set the state
- this way a user can update the URL and reload the page to set a new user.
- this functionality is reusable and uses a jotai store to sync states.
- this is scalable so that we can add more config and in that in the future the "Share" URL button is simply a copy of the location.href.



## Stage 10 - Release

### Stage 10a - Backend ready release

In `api/main.py`:
- refine prompts
- add authentication with sessions and reconnection
- IP based rate limits
- queueing of tasks as we only have 1 model to query at a time
- model caching and loading optimization
- possibly add ws

**Done when:** backend ready for release.


### Stage 10b - Frontend ready release

Frontend needs simple changes so that 
- assets will load in production
- will work for all major desktop sizes
- lazy loading for all assets and images


**Done when:** frontend ready for release.

### Stage 10c - Hosting & final QA

- backend and frontend hosting

**Done when:** frontend and backend successfully hosted and tested.



## Stage 11 - Theater mode

Fixed view with more ambience, better viewing. 
You could have a a dropdown with:
- movie selection
- setting to disable/enable ambient items like: fire, fireflies, starts, lighting...
- backend streams video directly from webarchive or local upload
- can use HLS with m3u8

---

## Notes for agents

- user does visual QA
- no tests
- Always use `bun` (eg. `bun dev`) for installs and scripts
- Backend runs at `http://127.0.0.1:8042`
- `captureFrame()` returns `Promise<string>` — base64 JPEG data URI
- MediaPipe selfie segmentation loaded from CDN at runtime (see `ProjectionCanvas.jsx:32`)
