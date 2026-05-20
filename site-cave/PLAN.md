# Allegory of the Cave — Build Plan

This file is editable. If you find things to resolve in a later stage or find better ways, you can edit this file. Do not use this as a changelog, only as a multi-session TODO.

## Current state

R3F cave scene with full atmosphere. Completed through Stage 2:

- Cave wall GLB with rocky material, fire lighting, volumetric god rays, dust particles
- WebCam shadow projected onto wall via MediaPipe segmentation + temporal accumulation
- UI: oracle widget, collapsible sidebar, live text tile, Raycast-like project picker
- GitHub project integration; jotai state; framer-motion animations
- KTX2/Draco asset pipeline, WebGPU where supported, tree-shaken bundle
- Backend: FastAPI + ollama at `http://127.0.0.1:8042`
- URL param `?user=` synced to jotai atom

Stack: Vite + React + R3F + @tanstack/react-query + jotai + framer-motion + tailwindcss. Run with `bun`.

---

## Stage 3 — Oracle Intelligence

Backend-first features that give the oracle memory, presence, and persona. These share backend infrastructure and should land together.

### Stage 3a — Communication Mode

Oracle shifts from passive observer to active communicant when webcam is on. Oracle persona and tone changes depending on whether the webcam is active.

**Done when:** camera on/off toggles oracle persona; tone difference is clearly felt.

### Stage 3b — AI Status

Expose real-time oracle availability in the sidebar. Backend exposes a status endpoint; frontend polls and displays it.

**Done when:** sidebar status updates real-time, polling pauses when tab hidden.

### Stage 3c — Shadow Memory

Persistent cross-session memory so the oracle builds mythology over time. Includes a hand-authored Cave Bible injected into every system prompt, SQLite memory storage, and memory compression.

**Done when:** oracle has a bible, accumulates memories, fresh-mode works.

### Stage 3d — History Controls

User agency over oracle's memory: clear history, disable shadow memory, share memory.

**Done when:** all three controls work end-to-end.

---

## Stage 4 — Release

### Stage 4a — Backend

- Refine prompts
- Auth with sessions and reconnection
- IP-based rate limiting
- Task queue (single model, one at a time)
- Model caching and loading optimization
- Possibly add WebSocket for streaming

**Done when:** backend ready for production traffic.

### Stage 4b — Frontend

- Assets load correctly in production build
- Works on all major desktop sizes
- Lazy loading for assets and images

**Done when:** `bun build` produces a working production bundle.

### Stage 4c — Hosting & QA

- Deploy backend + frontend
- End-to-end smoke test on hosted URLs

**Done when:** both services hosted and verified live.

---

## Stage 5 — Theater Mode

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
