# Allegory of the Cave — Build Plan

This file is editable. If you find things to resolve in a later stage or find better ways, you can edit this file. Do not use this as a changelog, only as a multi-session TODO.

## Current state

R3F cave scene with full atmosphere. Completed through Stage 8e:

- Cave wall GLB with rocky material, fire lighting, volumetric god rays, dust particles
- WebCam shadow projected onto wall via MediaPipe segmentation + temporal accumulation
- UI: oracle widget, collapsible sidebar, live text tile, Raycast-like project picker
- GitHub project integration; jotai state; framer-motion animations
- KTX2/Draco asset pipeline, WebGPU where supported, tree-shaken bundle
- Backend: FastAPI + ollama at `http://127.0.0.1:8042`

Stack: Vite + React + R3F + @tanstack/react-query + jotai + framer-motion + tailwindcss. Run with `bun`.

---

## Stage 1a — Three.js Optimization ✅

GLB loading pipeline: PNG/JPG → KTX2 → embed in GLB → `useGLTF()`.

- ✅ WebGPU enabled where supported
- ✅ Bundle tree-shaken (individual Three.js imports)
- ✅ KTX2/Draco loaders wired; reusable asset loading hooks/components
- ✅ White fade on scene load
- ✅ Preload hints for critical assets

---

## Stage 2 — URL Params & State ✅

**Goal:** make app config shareable via URL, foundation for future "Share" button.

- File `./src/components/ProjectSearch.jsx` should read `?user=` from `window.location.search` and use this as value. If no user is in the url, we fallback to the DEFAULT_USER.
- Sync to jotai atom so state is updated
- No router — just `URLSearchParams` on load
- Pattern is reusable: future params (project, mode, etc.) plug into same mechanism
- A future "Share" button = `location.href` + param `?user=${stored_user}`

**Done when:** `?user=wackojacko` sets GitHub user on load; env var removed.

---

## Stage 3 — Depth Echo (Anamorphic Portal Illusion)

A hidden scene rendered to texture, applied to the cave wall, with parallax lag that creates perceived depth behind the stone. Three sequential sub-stages.

### Stage 3a — RTT Foundation

**Goal:** establish hidden illusion scene + render-to-texture pipeline.

- Create offscreen `portalScene` (floating particles, fog plane, exaggerated-perspective geometry — monochrome, no complex lighting)
- Add `WebGLRenderTarget` (`portalTarget`) at 512×512 default, mobile-safe
- Apply `portalTarget.texture` as `map` on wall `ShaderMaterial` (UV-manipulable)
- Render `portalScene` each frame before main scene via `useFrame` priority or `gl.render` pre-pass

**Done when:** wall displays hidden portal scene via render texture. No parallax yet.

### Stage 3b — Parallax

**Goal:** parallax lag that creates perceived depth — the core illusion.

Depends on: Stage 2a.

- Track camera yaw delta each frame; store `smoothedOffset` in ref
  - `targetOffset = cameraYaw * 0.15`; `smoothedOffset += (target - current) * 0.08`
- Pass `smoothedOffset` as `uParallax` uniform to wall `ShaderMaterial`
- Fragment shader: `uv.x += uParallax; uv += vNormal.xy * 0.03;` — side-only, never Y
- Optional bounce-overshoot mode (ref-stored velocity, toggle `enableOvershoot`)

**Critical:** do NOT lock projection 1:1 to camera. Perfect lock = screen. Slight lag = volume. If it looks like a projector, increase lag and reduce sharpness.

**Done when:** slow horizontal rotation makes wall feel spatial — projection detaches, depth "breathes".

### Stage 3c — Polish & Settings

**Goal:** full settings panel, refine visual style, QA the illusion.

Depends on: Stage 2b.

Leva settings (defaults extracted to scene config):

- `enableDepthEcho` — master toggle
- `lagAmount`, `projectionSharpness`, `rockDistortion`, `fogDensity`
- `depthExaggeration`, `ghostTrail`, `monochrome`

Visual style: monochrome depth, soft fog, floating particles (reuse `Dust.jsx`), exaggerated perspective, slow drift, high-contrast cavities.

QA failures: wall looks like screen → increase `lagAmount`; projection feels locked → lower `projectionSharpness`; disappears at slight angles → reduce `rockDistortion`.

**Done when:** settings live, illusion passes manual rotation QA, ancient holographic stone feel.

---

## Stage 4 — Oracle Intelligence

Backend-first features that give the oracle memory, presence, and persona. These share backend infrastructure and should land together.

### Stage 4a — Communication Mode

**Goal:** oracle shifts from passive observer to active communicant when webcam is on.

- New POST field `communicationMode: bool` — `true` when `isActive` in `useAnalyze.js`
- Backend: different system prompt wrapper per mode (observer vs communicant). Same bible, different stance.
- `OracleWidget` glow shifts color when communicant mode active

**Done when:** camera on/off toggles oracle persona; tone difference is clearly felt.

### Stage 4b — AI Status

**Goal:** expose real-time oracle availability in the sidebar.

- Backend: `GET /status` → `{ status: "idle" | "busy" | "queued", queue?: number, eta_seconds?: number }`
- Module-level flag tracks state around each ollama call
- Frontend: `oracleStatusAtom` + `useOracleStatus.js` polling every 5s (pauses on tab hidden)
- Wire sidebar AI Status slot (Stage 8b placeholder) to live data: amber = idle, pulsing red = busy, queue count shown

**Done when:** sidebar status updates real-time, polling pauses when tab hidden.

### Stage 4c — Shadow Memory

**Goal:** persistent cross-session memory so the oracle builds mythology over time.

**Cave Bible (`api/bible.md`):** hand-authored ~10–30k token mythology document. Injected verbatim at top of every system prompt. Never compressed. Authoring is a creative task outside code — write it dense, specific, ancient.

**Backend:**

- SQLite `api/memory.db` — `memories` table with `id, text, session_id, timestamp`
- Inject order per `/analyze` call: `[bible] [responsive passage?] [compressed memories] [session history] [prompt]`
- Compression: when >80 rows, summarize to ~8 compressed entries via ollama; delete originals
- Responsive injection: lightweight regex scan of last output; if trigger matches, inject extra bible passage on next call. Triggers defined in config dict
- New POST field `fresh: bool` — skips memory + responsive injection (bible still injected)

**Frontend:** pass `fresh` from `freshModeAtom` through `useAnalyze.js`

**Done when:** oracle has a bible, accumulates memories, responsive passages fire, fresh-mode works.

### Stage 4d — History Controls

**Goal:** user agency over oracle's memory.

Depends on: Stage 4c backend.

Controls (in sidebar history slot from Stage 8b):

- **Clear history** — wipes `historyAtom` + `DELETE /memory` for current `session_id`
- **Disable shadow memory** — `freshModeAtom` toggle → `fresh: true` on all calls
- **Share memory** — opt-in checkbox; `POST /memory/share` re-tags session as `__shared__`

Backend endpoints: `DELETE /memory` (by session_id), `POST /memory/share`

**Done when:** all three controls work end-to-end.

---

## Stage 5 — Release

### Stage 5a — Backend

- Refine prompts
- Auth with sessions and reconnection
- IP-based rate limiting
- Task queue (single model, one at a time)
- Model caching and loading optimization
- Possibly add WebSocket for streaming

**Done when:** backend ready for production traffic.

### Stage 5b — Frontend

- Assets load correctly in production build
- Works on all major desktop sizes
- Lazy loading for assets and images

**Done when:** `bun build` produces a working production bundle.

### Stage 5c — Hosting & QA

- Deploy backend + frontend
- End-to-end smoke test on hosted URLs

**Done when:** both services hosted and verified live.

---

## Stage 6 — Theater Mode

Fixed cinematic view with enhanced ambience.

- Dropdown: movie/video selection
- Toggle ambient items: fire, fireflies, stars, lighting
- Backend streams video from webarchive or local upload (HLS with m3u8)
- `theater` / `exit-theater` commands already scaffolded in project picker

---

## Notes for agents

- User does visual QA; no automated tests
- Always use `bun` (e.g. `bun dev`) for installs and scripts
- Backend runs at `http://127.0.0.1:8042`
- `captureFrame()` returns `Promise<string>` — base64 JPEG data URI
- MediaPipe selfie segmentation loaded from CDN at runtime
- Default leva values must always be extracted to scene config — leva is additive, not the source of truth
