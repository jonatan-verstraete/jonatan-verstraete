import { useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Video } from "./Video";
import { ProjectText } from "./ProjectText";
import { VideoCam } from "./VideoCam";

// ── Fullscreen-quad vertex shader (no projectionMatrix needed — already clip-space) ──
const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

// ── Separable Gaussian blur (5-tap, ~σ=1.4) ──
const H_BLUR_FRAG = `
uniform sampler2D uTex;
uniform float uRadius;
uniform float uTexelW;
varying vec2 vUv;
void main() {
  float w[5];
  w[0]=0.2270270270; w[1]=0.1945945946; w[2]=0.1216216216; w[3]=0.0540540541; w[4]=0.0162162162;
  vec4 col = texture2D(uTex, vUv) * w[0];
  for (int i=1;i<5;i++) {
    float off = float(i) * uRadius * uTexelW;
    col += texture2D(uTex, vUv + vec2(off, 0.0)) * w[i];
    col += texture2D(uTex, vUv - vec2(off, 0.0)) * w[i];
  }
  gl_FragColor = col;
}`;

const V_BLUR_FRAG = `
uniform sampler2D uTex;
uniform float uRadius;
uniform float uTexelH;
varying vec2 vUv;
void main() {
  float w[5];
  w[0]=0.2270270270; w[1]=0.1945945946; w[2]=0.1216216216; w[3]=0.0540540541; w[4]=0.0162162162;
  vec4 col = texture2D(uTex, vUv) * w[0];
  for (int i=1;i<5;i++) {
    float off = float(i) * uRadius * uTexelH;
    col += texture2D(uTex, vUv + vec2(0.0, off)) * w[i];
    col += texture2D(uTex, vUv - vec2(0.0, off)) * w[i];
  }
  gl_FragColor = col;
}`;

// ── Temporal accumulation — mix(current, previous, decay) + contrast boost ──
// decay=0 → no trail (pure current frame), decay=0.95 → long ghost trails
// uContrast > 1 pushes lights brighter and darks darker for more visible projection
const ACCUM_FRAG = `
uniform sampler2D uCurrent;
uniform sampler2D uPrev;
uniform float uDecay;
uniform float uContrast;
varying vec2 vUv;
void main() {
  vec4 curr = texture2D(uCurrent, vUv);
  vec4 prev = texture2D(uPrev, vUv);
  vec4 mixed = mix(curr, prev, uDecay);
  mixed.rgb = clamp((mixed.rgb - 0.5) * uContrast + 0.5, 0.0, 1.0);
  gl_FragColor = mixed;
}`;

function makeRT(w, h) {
  return new THREE.WebGLRenderTarget(w, h, {
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
  });
}

// Minimal scene + ortho cam + fullscreen quad for offscreen passes
function makePassScene() {
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const geo = new THREE.PlaneGeometry(2, 2);
  const mesh = new THREE.Mesh(geo);
  scene.add(mesh);
  return { scene, cam, mesh, dispose: () => geo.dispose() };
}

const BLUR_W = 1024,
  BLUR_H = 512; // blur at half-res (fine for soft kernel)
const GOBO_W = 2048,
  GOBO_H = 1024; // full gobo + accumulation res

/**
 * ProjectedSurface — renders the gobo scene, then:
 *   1. H+V Gaussian blur → soft cave-stone diffusion (option B)
 *   2. Temporal accumulation → ghost trails / lingering shadows (option E)
 *
 * The final output render target is exposed to the parent via `onAccumRef(ref)`.
 * Parent updates spotlight.map = ref.current.texture each frame.
 */
export function ProjectedSurface({
  target,
  videoRef,
  isActive,
  threshold,
  softness,
  blurRadius,
  accumDecay,
  goboContrast,
  onAccumRef,
}) {
  // ── Gobo portal scene ──
  const [gobScene, gobCam] = useMemo(() => {
    const s = new THREE.Scene();
    // Bright background so spotlight gobo passes light through base areas.
    // Without this, dark background blocks all light even when VideoCam has no shadow layer.
    s.background = new THREE.Color(0xc8c8c8);
    const cam = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
    cam.position.set(0, 0, 5);
    return [s, cam];
  }, []);

  // ── Render targets ──
  const blurA = useMemo(() => makeRT(BLUR_W, BLUR_H), []);
  const blurB = useMemo(() => makeRT(BLUR_W, BLUR_H), []);
  const accumA = useMemo(() => makeRT(GOBO_W, GOBO_H), []);
  const accumB = useMemo(() => makeRT(GOBO_W, GOBO_H), []);
  // Tracks which accumulation buffer is the latest output
  const accumRef = useRef(accumA);

  // ── Shared fullscreen-quad pass scene ──
  const pass = useMemo(() => makePassScene(), []);

  // ── Pass materials ──
  const hBlurMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: null },
          uRadius: { value: 2.5 },
          uTexelW: { value: 1 / BLUR_W },
        },
        vertexShader: VERT,
        fragmentShader: H_BLUR_FRAG,
      }),
    [],
  );

  const vBlurMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uTex: { value: null },
          uRadius: { value: 2.5 },
          uTexelH: { value: 1 / BLUR_H },
        },
        vertexShader: VERT,
        fragmentShader: V_BLUR_FRAG,
      }),
    [],
  );

  const accumMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uCurrent: { value: null },
          uPrev: { value: null },
          uDecay: { value: 0.88 },
          uContrast: { value: 1.35 },
        },
        vertexShader: VERT,
        fragmentShader: ACCUM_FRAG,
      }),
    [],
  );

  // ── Cleanup ──
  useEffect(
    () => () => {
      blurA.dispose();
      blurB.dispose();
      accumA.dispose();
      accumB.dispose();
      hBlurMat.dispose();
      vBlurMat.dispose();
      accumMat.dispose();
      pass.dispose();
    },
    [blurA, blurB, accumA, accumB, hBlurMat, vBlurMat, accumMat, pass],
  );

  // ── Expose accumRef so parent can point spotlight.map at it ──
  useEffect(() => {
    onAccumRef?.(accumRef);
  }, [onAccumRef]);

  // ── Sync leva / prop uniforms ──
  useEffect(() => {
    hBlurMat.uniforms.uRadius.value = blurRadius ?? 2.5;
    vBlurMat.uniforms.uRadius.value = blurRadius ?? 2.5;
  }, [blurRadius, hBlurMat, vBlurMat]);

  useEffect(() => {
    accumMat.uniforms.uDecay.value = accumDecay ?? 0.88;
  }, [accumDecay, accumMat]);

  useEffect(() => {
    accumMat.uniforms.uContrast.value = goboContrast ?? 1.35;
  }, [goboContrast, accumMat]);

  // ── Pipeline — runs before parent's spotlight map update (priority 0) ──
  useFrame(({ gl }) => {
    const prevAutoClear = gl.autoClear;
    gl.autoClear = true;

    // 1. Render gobo portal scene → target (2048×1024)
    gl.setRenderTarget(target);
    gl.render(gobScene, gobCam);

    // 2. H-blur: target → blurA (1024×512)
    pass.mesh.material = hBlurMat;
    hBlurMat.uniforms.uTex.value = target.texture;
    gl.setRenderTarget(blurA);
    gl.render(pass.scene, pass.cam);

    // 3. V-blur: blurA → blurB (1024×512)
    pass.mesh.material = vBlurMat;
    vBlurMat.uniforms.uTex.value = blurA.texture;
    gl.setRenderTarget(blurB);
    gl.render(pass.scene, pass.cam);

    // 4. Accumulate: mix(blurB, prevAccum, decay) → nextAccum (ping-pong)
    const prevAccum = accumRef.current;
    const nextAccum = prevAccum === accumA ? accumB : accumA;
    pass.mesh.material = accumMat;
    accumMat.uniforms.uCurrent.value = blurB.texture;
    accumMat.uniforms.uPrev.value = prevAccum.texture;
    gl.setRenderTarget(nextAccum);
    gl.render(pass.scene, pass.cam);
    accumRef.current = nextAccum;

    gl.setRenderTarget(null);
    gl.autoClear = prevAutoClear;
  }, 0);

  return createPortal(
    <>
      <ProjectText />
      {/* {!isActive && <Video />} */}
      <Video />

      <VideoCam
        videoRef={videoRef}
        isActive={isActive}
        threshold={threshold}
        softness={softness}
      />
    </>,
    gobScene,
  );
}
