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

A hidden scene rendered to texture, co-planar overlay on the wall, parallax lag → perceived depth behind stone. Three sequential sub-stages. All logic lives in a new component `src/scene/Wall/DepthEchoOverlay.jsx`. **Wall.jsx must not be modified.**

---

### Architecture constraints derived from codebase

**Wall world transform (from `config.js` + `Wall.jsx` position/scale formula):**
- World position: `[-1.22, -0.53, -3.47]`
  - x = wallX = -1.22
  - y = -1 + wallY = -1 + 0.47 = -0.53
  - z = -2 + wallZ = -2 + (-1.47) = -3.47
- Scale: `0.25 + wallScale = 0.25 + 0.05 = 0.30`
- Rotation: `[0.29, Math.PI, 0]` (wallRotX=0.29, always rotated π around Y)
- Wall face normal: points in **world +Z** (toward camera) because rotation.y = π flips the GLB

**Wall face dimensions — ⚠ ASSUMPTION:** `Wall.jsx` renders `/models/wall.glb` as a `<primitive>` — no PlaneGeometry, no hard-coded width/height in code. Face size must be measured at runtime:
```js
const box = new THREE.Box3().setFromObject(wallGLBScene);
const size = box.getSize(new THREE.Vector3()); // at world scale 0.30
```
Best estimate pending measurement: **~4.0 × 3.0 world units** at scale 0.30. The overlay plane width/height must be tuned to fill the wall face — expose as Leva params `overlayW` / `overlayH` during 3a and lock them once the fit looks right.

**Camera yaw source:** `<OrbitControls />` (drei) drives the main R3F camera. Camera yaw is `camera.rotation.y` via `useThree().camera` — available every frame from any `useFrame` callback. No custom camera ref needed.

**Existing RTT pipeline:** `ProjectedSurface` (`src/scene/ProjectedSurface/index.jsx`) already runs its own offscreen render (gobo scene → blur → accumulation). The depth echo system is **fully separate** — different scene, different target, different useFrame priority (-1). Do not merge with or depend on the gobo pipeline.

---

### Stage 3a — RTT Foundation

**Goal:** three isolated parts wired end-to-end. Wall displays portal texture. No parallax yet.

Depends on: nothing (standalone).

New file: `src/scene/Wall/DepthEchoOverlay.jsx`

---

#### Part 1 — portalScene (offscreen, never in main scene graph)

Created once with `useMemo`. **Never passed to `<Canvas>` or added to the main scene.** Only used as the source for `gl.render`.

```
portalScene  = new THREE.Scene()
portalScene.background = new THREE.Color(0x000000)  // black void

portalCamera = new THREE.PerspectiveCamera(
  90,          // wide FOV — exaggerated perspective is the illusion
  1.0,         // square aspect (512×512 target)
  0.01,        // close near — particles can get very close
  20           // far
)
portalCamera.position.set(0, 0, 2.0)  // looking toward origin
portalCamera.lookAt(0, 0, 0)
```

⚠ ASSUMPTION on camera position: geometry scale of ~2 world units assumed based on scene scale (wall at z=-3.47, particles/rings at 1-2 unit radius). Adjust if particles are clipped or too distant.

Geometry added to portalScene (all use MeshBasicMaterial, monochrome white/grey, no lights):

- **Particles** — reuse pattern from `src/scene/VFX/Dust.jsx`. ~200 Points instances scattered in a 2×2×2 box centered at origin. White, size 0.04.
- **Fog plane** — a `PlaneGeometry(3, 3)` at z=-1.0, MeshBasicMaterial white, opacity 0.06, transparent, depthWrite false. Simulates volumetric haze.
- **Depth rings** — 3–5 `RingGeometry` meshes at z = [-0.5, -1.0, -1.5, -2.0, -2.5], radii stepping from 0.3 to 1.2, MeshBasicMaterial white opacity 0.12. These give the depth stratification that sells the illusion.

No lights added to portalScene — all emissive-only via MeshBasicMaterial.

---

#### Part 2 — WebGLRenderTarget pre-pass

```js
const portalTarget = useMemo(() => new WebGLRenderTarget(512, 512, {
  minFilter: THREE.LinearFilter,
  magFilter: THREE.LinearFilter,
}), [])

useFrame(({ gl }) => {
  gl.setRenderTarget(portalTarget)
  gl.render(portalScene, portalCamera)
  gl.setRenderTarget(null)
}, -1)  // priority -1 → runs before main scene render
```

Output: `portalTarget.texture` — live, updated every frame, fed to Part 3.

Dispose in `useEffect` cleanup: `portalTarget.dispose()`.

---

#### Part 3 — Co-planar overlay plane

A `<mesh>` inside `DepthEchoOverlay.jsx` rendered into the **main scene** (no portal, no createPortal).

**Position:** wall world position + 0.05 offset along world +Z (toward camera):
```
position={[-1.22, -0.53, -3.47 + 0.05]}  →  [-1.22, -0.53, -3.42]
```

**Rotation:** identical to wall: `[0.29, Math.PI, 0]`

**Geometry:** `<planeGeometry args={[overlayW, overlayH]} />` where `overlayW` and `overlayH` start at the best estimate (~4.0, ~3.0) and are exposed as Leva controls during development, then locked to config once the fit is confirmed visually.

**Material — ShaderMaterial:**
```js
new THREE.ShaderMaterial({
  uniforms: {
    map:            { value: portalTarget.texture },
    uParallax:      { value: 0.0 },
    uOpacity:       { value: 0.35 },
    uRockDistortion:{ value: 0.03 },
  },
  blending:    THREE.AdditiveBlending,
  depthWrite:  false,
  transparent: true,
  vertexShader: `
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vUv = uv;
      vNormal = normalize(normalMatrix * normal);
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D map;
    uniform float uParallax;
    uniform float uOpacity;
    uniform float uRockDistortion;
    varying vec2 vUv;
    varying vec3 vNormal;
    void main() {
      vec2 uv = vUv;
      uv.x += uParallax;
      uv += vNormal.xy * uRockDistortion;
      vec4 echo = texture2D(map, uv);
      gl_FragColor = vec4(echo.rgb * uOpacity, 1.0);
    }
  `,
})
```

Wire `onBeforeRender` or `useFrame` to update `material.uniforms.map.value = portalTarget.texture` each frame (texture ref is stable so this is a no-op after first frame, but keep it for safety).

**Done when:** wall shows a faint monochrome depth texture (particles + rings visible through stone). No movement yet. `uParallax` is hardcoded 0.0.

---

### Stage 3b — Parallax

**Goal:** UV-space parallax lag = perceived depth.

Depends on: Stage 3a complete.

**Camera yaw extraction:**
```js
const { camera } = useThree()
const prevYawRef    = useRef(camera.rotation.y)
const targetOffRef  = useRef(0)
const smoothedRef   = useRef(0)
const velocityRef   = useRef(0)  // only used in overshoot mode
```

Inside `useFrame` at priority 0 (after the -1 pre-pass):
```js
const currentYaw = camera.rotation.y
const deltaYaw   = currentYaw - prevYawRef.current
prevYawRef.current = currentYaw

targetOffRef.current += deltaYaw * lagAmount   // lagAmount default 0.15

// Standard lerp mode:
smoothedRef.current += (targetOffRef.current - smoothedRef.current) * 0.08

// Overshoot mode (when ghostTrail / overshoot enabled):
// velocityRef.current += (targetOffRef.current - smoothedRef.current) * 0.12  // tension
// velocityRef.current *= 0.85                                                   // damping
// smoothedRef.current += velocityRef.current

overlayMat.uniforms.uParallax.value = smoothedRef.current
```

**Critical constraint — document in code comments:** `uParallax` drives UV shift only. **Nothing in the scene moves. No geometry translates. No camera is modified.** The illusion is entirely UV-space. If any mesh position changes with camera rotation, the effect becomes a parallax video wall — wrong.

**Failure modes:**
| Symptom | Cause | Fix |
|---|---|---|
| Looks like video on a wall | lagAmount too low | Increase lagAmount toward 0.3 |
| Feels locked to camera | smoothing factor too high | 0.08 is correct — do not raise |
| Disappears at slight angles | rockDistortion too high | Reduce uRockDistortion toward 0.01 |

**Done when:** slow horizontal camera rotation makes wall feel like it has spatial depth — the texture "detaches" and drifts back.

---

### Stage 3c — Settings

**Goal:** Leva panel wired to depth echo, all defaults in `config.js`.

Depends on: Stage 3b complete.

Add to `src/scene/config.js` (`SCENE_CONFIG` object):
```js
// Depth Echo
enableDepthEcho:       true,
echoOpacity:           0.35,
lagAmount:             0.15,
projectionSharpness:   1.0,
rockDistortion:        0.03,
echoFogDensity:        0.4,   // fog density inside portalScene fog plane opacity
depthExaggeration:     1.2,   // multiplier on particle/ring z spread
ghostTrail:            false, // enables overshoot mode in parallax
monochrome:            true,  // if false: allow slight warm tint on portal geo
```

Add a `DepthEcho` Leva folder in `src/scene/index.jsx` (same pattern as existing `Shadow` folder):
```js
DepthEcho: folder({
  enableDepthEcho:     { value: C.enableDepthEcho },
  echoOpacity:         { value: C.echoOpacity,       min: 0, max: 1,   step: 0.01 },
  lagAmount:           { value: C.lagAmount,          min: 0, max: 0.5, step: 0.01 },
  projectionSharpness: { value: C.projectionSharpness,min: 0.1, max: 3, step: 0.05 },
  rockDistortion:      { value: C.rockDistortion,    min: 0, max: 0.1, step: 0.005 },
  echoFogDensity:      { value: C.echoFogDensity,    min: 0, max: 1,   step: 0.01 },
  depthExaggeration:   { value: C.depthExaggeration, min: 0.5, max: 3, step: 0.05 },
  ghostTrail:          { value: C.ghostTrail },
  monochrome:          { value: C.monochrome },
})
```

Pass all values as props from `<Scene>` to `<DepthEchoOverlay>`. Props drive uniforms; config is source of truth for defaults.

`enableDepthEcho` false → set `overlayMesh.visible = false` and skip the portalScene pre-pass render.

`depthExaggeration` → multiply ring/particle z positions each frame (or rebuild geometry). Simple approach: store ring meshes in refs and set `ring.position.z = baseZ * depthExaggeration` in useFrame.

`monochrome` false → allow a faint warm tint: multiply `echo.rgb` by `vec3(1.0, 0.9, 0.7)` in the fragment shader via a uniform.

`ghostTrail` true → switch useFrame to overshoot mode (velocity accumulation instead of direct lerp).

QA checklist (manual):
- [ ] Slow left-right camera rotation: texture drifts back, feels like depth behind stone
- [ ] Fast snap: brief overshoot, settles (overshoot mode)
- [ ] `enableDepthEcho` false: wall returns to plain rocky material, no performance cost
- [ ] Edge: `rockDistortion` at 0.03 — texture visible at 45° camera angle without disappearing

**Done when:** all Leva controls live, illusion passes rotation QA, monochrome depth-cave aesthetic holds.

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
