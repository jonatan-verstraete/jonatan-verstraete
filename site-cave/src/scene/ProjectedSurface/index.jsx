import { useEffect, useRef } from 'react';
import { createPortal, useFrame } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import {
  Color,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three';
import { useDisposableItems } from '@/hooks/useDisposableItems';
import { SCENE_CONFIG as C } from '@/scene/config';
import { ProjectText } from './ProjectText';
import { Video } from './Video';
import { VideoCam } from './VideoCam';

const VERT = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

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

// decay=0 → no trail, decay=0.95 → long ghost trails
// uContrast > 1 pushes lights brighter / darks darker for more visible projection
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
  return new WebGLRenderTarget(w, h, {
    minFilter: LinearFilter,
    magFilter: LinearFilter,
  });
}

const BLUR_W = 1024,
  BLUR_H = 512;
const GOBO_W = 2048,
  GOBO_H = 1024;

/**
 * ProjectedSurface — gobo scene → H+V Gaussian blur → temporal accumulation.
 * Exposes the final accumulation RT via surfaceRef(ref) so the parent can
 * point spotlight.map at it each frame.
 */
export function ProjectedSurface({ videoRef, isActive, surfaceRef }) {
  const { shadowThreshold, shadowSoftness, blurRadius, accumDecay, goboContrast } = useControls({
    Shadow: folder({
      shadowThreshold: { value: C.shadowThreshold, min: 0, max: 1, step: 0.01 },
      shadowSoftness: { value: C.shadowSoftness, min: 0, max: 0.5, step: 0.01 },
      blurRadius: { value: C.blurRadius, min: 0, max: 8, step: 0.1 },
      accumDecay: { value: C.accumDecay, min: 0, max: 0.97, step: 0.01 },
      goboContrast: { value: C.goboContrast, min: 1.0, max: 3.0, step: 0.05 },
    }),
  });

  // ── Gobo portal scene ──
  const gobRef = useRef(null);
  if (!gobRef.current) {
    const s = new Scene();
    s.background = new Color(0xc8c8c8);
    const cam = new OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
    cam.position.set(0, 0, 5);
    gobRef.current = { scene: s, cam };
  }

  // ── Render targets ──
  const rts = useDisposableItems(() => {
    const accumA = makeRT(GOBO_W, GOBO_H);
    surfaceRef.current = accumA ?? null;

    return {
      gobo: makeRT(GOBO_W, GOBO_H),
      blurA: makeRT(BLUR_W, BLUR_H),
      blurB: makeRT(BLUR_W, BLUR_H),
      accumA,
      accumB: makeRT(GOBO_W, GOBO_H),
    };
  });

  // ── Pass materials + fullscreen-quad scene ──
  const pass = useDisposableItems(() => {
    const scene = new Scene();
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geo = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geo);
    scene.add(mesh);

    return {
      scene,
      cam,
      mesh,
      geo,
      hBlur: new ShaderMaterial({
        uniforms: {
          uTex: { value: null },
          uRadius: { value: C.blurRadius },
          uTexelW: { value: 1 / BLUR_W },
        },
        vertexShader: VERT,
        fragmentShader: H_BLUR_FRAG,
      }),
      vBlur: new ShaderMaterial({
        uniforms: {
          uTex: { value: null },
          uRadius: { value: C.blurRadius },
          uTexelH: { value: 1 / BLUR_H },
        },
        vertexShader: VERT,
        fragmentShader: V_BLUR_FRAG,
      }),
      accum: new ShaderMaterial({
        uniforms: {
          uCurrent: { value: null },
          uPrev: { value: null },
          uDecay: { value: C.accumDecay },
          uContrast: { value: C.goboContrast },
        },
        vertexShader: VERT,
        fragmentShader: ACCUM_FRAG,
      }),
    };
  });

  // ── Sync leva uniforms ──
  useEffect(() => {
    const p = pass.current;
    if (!p) return;
    p.hBlur.uniforms.uRadius.value = blurRadius ?? C.blurRadius;
    p.vBlur.uniforms.uRadius.value = blurRadius ?? C.blurRadius;
  }, [blurRadius]);

  useEffect(() => {
    const p = pass.current;
    if (!p) return;
    p.accum.uniforms.uDecay.value = accumDecay ?? C.accumDecay;
  }, [accumDecay]);

  useEffect(() => {
    const p = pass.current;
    if (!p) return;
    p.accum.uniforms.uContrast.value = goboContrast ?? C.goboContrast;
  }, [goboContrast]);

  // ── Render pipeline (priority 0 — before spotlight map update) ──
  useFrame(({ gl }) => {
    const r = rts.current;
    const p = pass.current;
    const gobScene = gobRef.current.scene;
    const gobCam = gobRef.current.cam;
    if (!r || !p) return;

    const prevAutoClear = gl.autoClear;
    gl.autoClear = true;

    // 1. Render gobo portal scene → gobo (2048×1024)
    gl.setRenderTarget(r.gobo);
    gl.render(gobScene, gobCam);

    // 2. H-blur: gobo → blurA (1024×512)
    p.mesh.material = p.hBlur;
    p.hBlur.uniforms.uTex.value = r.gobo.texture;
    gl.setRenderTarget(r.blurA);
    gl.render(p.scene, p.cam);

    // 3. V-blur: blurA → blurB (1024×512)
    p.mesh.material = p.vBlur;
    p.vBlur.uniforms.uTex.value = r.blurA.texture;
    gl.setRenderTarget(r.blurB);
    gl.render(p.scene, p.cam);

    // 4. Accumulate: mix(blurB, prevAccum, decay) → nextAccum (ping-pong)
    const prevAccum = surfaceRef.current ?? r.accumA;
    const nextAccum = prevAccum === r.accumA ? r.accumB : r.accumA;
    p.mesh.material = p.accum;
    p.accum.uniforms.uCurrent.value = r.blurB.texture;
    p.accum.uniforms.uPrev.value = prevAccum.texture;
    gl.setRenderTarget(nextAccum);
    gl.render(p.scene, p.cam);
    surfaceRef.current = nextAccum;

    gl.setRenderTarget(null);
    gl.autoClear = prevAutoClear;
  }, 0);

  return createPortal(
    <>
      <ProjectText />
      <Video />
      <VideoCam
        videoRef={videoRef}
        isActive={isActive}
        threshold={shadowThreshold}
        softness={shadowSoftness}
      />
    </>,
    gobRef.current.scene,
  );
}
