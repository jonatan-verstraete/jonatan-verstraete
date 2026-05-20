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

## Stage 3 — Depth Echo (Parallax Shadow Reprojection)

The wall shows a faint echo of the same gobo/shadow projection, sampled from a virtually offset projector angle. As the viewer pans the camera, the echo drifts relative to the real projection — creating perceived depth behind the stone surface.

**Core concept:** sample the existing accumulated gobo texture (`accumRef` from `ProjectedSurface`) a second time using a virtual projector matrix that is slightly laterally offset from the real spotlight. The UV divergence between the two projectors at each wall fragment is the depth cue. No second RTT. No separate Three.js scene.

All logic lives in a new component `src/scene/Wall/DepthEchoOverlay.jsx`. **Wall.jsx must not be modified.**

---

### Architecture constraints derived from codebase

**Wall world transform (from `config.js` + `Wall.jsx`):**
- World position: `[-1.22, -0.53, -3.47]`
- Scale: `0.30`; Rotation: `[0.29, Math.PI, 0]`
- Wall face normal points **world +Z** (toward camera)

**Overlay plane size:** best estimate ~4.0 × 3.0 world units at scale 0.30. Expose as Leva params `overlayW` / `overlayH` in Stage 3a and lock once visually confirmed.

**Camera yaw:** `camera.rotation.y` via `useThree().camera`, readable every frame.

**Gobo texture source:** `ProjectedSurface` exposes `accumRef` (a `React.MutableRefObject<WebGLRenderTarget>`) via the `onAccumRef` callback to `Scene`. `Scene` stores it in `surfaceAccumRef`. Pass both `surfaceAccumRef` and `spotRef` as props to `DepthEchoOverlay`.

**Spotlight projector matrix:** built from the spotlight's shadow camera each frame:
```js
const shadowCam = spotRef.current.shadow.camera
shadowCam.updateMatrixWorld()
projMatrix.multiplyMatrices(shadowCam.projectionMatrix, shadowCam.matrixWorldInverse)
```
This is the same coordinate system Three.js uses internally to project the gobo map, so the echo aligns with the real projection.

---

### Stage 3a — Static echo (no parallax) ✅

**Goal:** overlay mesh on wall shows faint echo of the live gobo/shadow at zero offset. No camera movement needed yet.

Depends on: nothing (standalone, `ProjectedSurface` already runs).

New file: `src/scene/Wall/DepthEchoOverlay.jsx`

Props: `spotRef`, `accumRef`

**Overlay mesh:**
- Position: `[-1.22, -0.53, -3.42]` (0.05 in front of wall)
- Rotation: `[0.29, Math.PI, 0]`
- Geometry: `<planeGeometry args={[overlayW, overlayH]} />` (Leva defaults: 4.0 × 3.0)

**ShaderMaterial uniforms:**
```js
{
  uAccumTex:   { value: null },                    // live gobo texture, set each frame
  uProjMatrix: { value: new THREE.Matrix4() },     // spotlight projector matrix, updated each frame
  uEchoOffset: { value: new THREE.Vector2(0, 0) }, // zero until Stage 3b
  uOpacity:    { value: 0.35 },
}
```

**Vertex shader:**
```glsl
uniform mat4 uProjMatrix;
varying vec4 vProjCoord;
void main() {
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vProjCoord = uProjMatrix * worldPos;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
```

**Fragment shader:**
```glsl
uniform sampler2D uAccumTex;
uniform vec2 uEchoOffset;
uniform float uOpacity;
varying vec4 vProjCoord;
void main() {
  vec2 uv = (vProjCoord.xy / vProjCoord.w) * 0.5 + 0.5 + uEchoOffset;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) discard;
  vec4 echo = texture2D(uAccumTex, uv);
  gl_FragColor = vec4(echo.rgb * uOpacity, 1.0);
}
```

Blending: `THREE.AdditiveBlending`, `depthWrite: false`, `transparent: true`.

**`useFrame` at priority 0:**
```js
useFrame(() => {
  const spot = spotRef.current
  const accum = accumRef.current?.current
  if (!spot || !accum) return
  const shadowCam = spot.shadow.camera
  shadowCam.updateMatrixWorld()
  mat.uniforms.uProjMatrix.value.multiplyMatrices(
    shadowCam.projectionMatrix,
    shadowCam.matrixWorldInverse
  )
  mat.uniforms.uAccumTex.value = accum.texture
}, 0)
```

**Wiring in `scene/index.jsx`:**
```jsx
<DepthEchoOverlay spotRef={spotRef} accumRef={surfaceAccumRef} />
```
Mount after `<Wall />`. No other changes to `scene/index.jsx`.

**Done when:** wall shows a faint additive echo of the shadow/video projection layered on top. With no video active, echo is dark. With video/webcam shadow, echo is a dim copy.

---

### Stage 3b — Parallax

**Goal:** shift `uEchoOffset.x` based on smoothed camera yaw delta → echo drifts relative to real projection as viewer pans.

Depends on: Stage 3a complete.

Add to the same `useFrame`:
```js
const currentYaw = camera.rotation.y
const deltaYaw = currentYaw - prevYawRef.current
prevYawRef.current = currentYaw

targetOffRef.current += deltaYaw * lagAmount    // default lagAmount: 0.08
smoothedRef.current += (targetOffRef.current - smoothedRef.current) * 0.06

mat.uniforms.uEchoOffset.value.x = smoothedRef.current
```

`lagAmount` controls how much the echo shifts per radian of camera rotation. Start at 0.08; tune up if the effect is too subtle.

**Critical constraint:** only `uEchoOffset` changes. No mesh moves, no camera changes, no geometry rebuilds.

**Done when:** slow horizontal pan causes echo to drift fractionally, creating depth-behind-stone sensation.

---

### Stage 3c — Settings

**Goal:** Leva controls + `config.js` defaults.

Depends on: Stage 3b complete.

Add to `src/scene/config.js`:
```js
// Depth Echo
enableDepthEcho: true,
echoOpacity:     0.35,
echoLagAmount:   0.08,
echoGhostTrail:  false,   // true → spring/overshoot mode instead of lerp
```

Add `DepthEcho` Leva folder in `scene/index.jsx`, pass as props to `DepthEchoOverlay`.

`enableDepthEcho` false → `overlayMesh.visible = false`, skip uniform updates.

`echoGhostTrail` true → replace lerp with spring: `velocity += (target - smoothed) * 0.12; velocity *= 0.85; smoothed += velocity`.

QA checklist:
- [ ] Slow left-right pan: echo drifts back, wall feels 3D
- [ ] Fast snap: brief overshoot and settle (ghost trail on)
- [ ] `enableDepthEcho` false: no visible change to wall, no perf cost
- [ ] No video active: echo invisible (black × additive = nothing)

**Done when:** all controls live, illusion passes pan QA.

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
