import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useAtomValue } from 'jotai';
import { AdditiveBlending, CanvasTexture, ShaderMaterial } from 'three';
import { selectedProjectAtom } from '../../store/cave';

const TRANSITION_DURATION = 0.55;

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Shadow-like shader with glitch dissolve on content change.
// uMap  = incoming (new) texture, uPrev = outgoing (old) texture.
// uT    = 0 → show prev, 1 → show next, mid → glitch blend.
// uTime drives heat-shimmer and scan-line noise seed.
const fragmentShader = `
uniform sampler2D uMap;
uniform sampler2D uPrev;
uniform float uTime;
uniform float uT;
varying vec2 vUv;

float rand(vec2 co) {
  return fract(sin(dot(co, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 uv = vUv;

  // Heat shimmer (always active)
  uv.x += sin(vUv.y * 28.0 + uTime * 1.4) * 0.0007;
  uv.y += cos(vUv.x * 22.0 + uTime * 1.1) * 0.0005;

  vec4 col;

  if (uT <= 0.001) {
    col = texture2D(uPrev, uv);
  } else if (uT >= 0.999) {
    col = texture2D(uMap, uv);
  } else {
    // Scan-line tears: block-aligned horizontal displacement
    float block   = floor(vUv.y * 24.0) / 24.0;
    float noise   = rand(vec2(block, floor(uTime * 16.0)));
    float midPeak = 1.0 - abs(uT * 2.0 - 1.0); // peaks at uT = 0.5
    float tear    = step(0.55, noise) * midPeak * 0.07;
    vec2 glitchUv = uv + vec2(tear * (noise - 0.5) * 2.0, 0.0);

    // Chromatic aberration on the incoming texture
    float aberr  = midPeak * 0.005;
    vec4 rCh     = texture2D(uMap, glitchUv + vec2(aberr, 0.0));
    vec4 gCh     = texture2D(uMap, glitchUv);
    vec4 bCh     = texture2D(uMap, glitchUv - vec2(aberr, 0.0));
    vec4 nextCol = vec4(rCh.r, gCh.g, bCh.b, gCh.a);

    vec4 prevCol = texture2D(uPrev, uv);
    float ease   = smoothstep(0.0, 1.0, uT);
    col = mix(prevCol, nextCol, ease);
  }

  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));
  col.r = min(col.r * 1.08, 1.0);
  col.b *= 0.8;

  gl_FragColor = vec4(col.rgb, luma);
}
`;

export const ProjectText = () => {
  const { title, description } = useAtomValue(selectedProjectAtom) ?? {};

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: null },
          uPrev: { value: null },
          uTime: { value: 0 },
          uT: { value: 1 }, // start at 1: no prev, show current immediately
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const prevTexRef = useRef(null);
  // NaN = idle, null = "start transition on next frame", number = start clock time
  const transRef = useRef(NaN);

  useEffect(() => {
    if (!title || !description) return;
    const canvas = buildGoboCanvas(title, description);
    const newTex = new CanvasTexture(canvas);
    const oldTex = mat.uniforms.uMap.value;

    if (oldTex) {
      prevTexRef.current?.dispose();
      prevTexRef.current = oldTex;
      mat.uniforms.uPrev.value = oldTex;
      mat.uniforms.uT.value = 0;
      transRef.current = null; // trigger start on next frame
    }

    mat.uniforms.uMap.value = newTex;

    return () => {
      newTex.dispose();
      mat.uniforms.uMap.value = null;
    };
  }, [title, description, mat]);

  useEffect(
    () => () => {
      prevTexRef.current?.dispose();
      mat.dispose();
    },
    [mat],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();
    mat.uniforms.uTime.value = t;

    if (transRef.current === null) {
      transRef.current = t;
    }
    if (!isNaN(transRef.current)) {
      const elapsed = t - transRef.current;
      mat.uniforms.uT.value = Math.min(elapsed / TRANSITION_DURATION, 1.0);
      if (elapsed >= TRANSITION_DURATION) {
        transRef.current = NaN;
      }
    }
  });

  return (
    <mesh renderOrder={1}>
      <planeGeometry args={[2, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};

function buildGoboCanvas(title, description) {
  const W = 2048;
  const H = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  const titleSize = Math.round(W * 0.07);
  const descSize = Math.round(W * 0.022);

  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  const maxW = Math.min(W * 0.65, 1400);
  const lines = wrapText(ctx, description, maxW);

  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // Glow pass
  ctx.shadowColor = '#ffffff';
  ctx.shadowBlur = 80;
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, W / 2, H / 2 - titleSize * 0.9);

  ctx.shadowBlur = 40;
  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#dddddd';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, H / 2 + titleSize * 0.4 + i * (descSize * 1.5));
  }

  // Sharp pass on top
  ctx.shadowBlur = 0;
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.fillText(title, W / 2, H / 2 - titleSize * 0.9);

  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  ctx.fillStyle = '#dddddd';
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, H / 2 + titleSize * 0.4 + i * (descSize * 1.5));
  }
  ctx.restore();

  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';
  for (const word of words) {
    const test = current ? current + ' ' + word : word;
    if (ctx.measureText(test).width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}
