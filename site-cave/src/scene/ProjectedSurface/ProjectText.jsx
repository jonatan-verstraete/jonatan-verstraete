import { useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Shadow-like shader: organic UV distortion simulates fire-lit edge flicker.
// Bright canvas areas (text/glow) let light through; subtle time-based wobble
// makes edges feel carved by heat rather than projected by a clean beam.
const fragmentShader = `
uniform sampler2D uMap;
uniform float uTime;
varying vec2 vUv;

void main() {
  vec2 uv = vUv;
  // Subtle heat-shimmer distortion on edges
  uv.x += sin(vUv.y * 28.0 + uTime * 1.4) * 0.0007;
  uv.y += cos(vUv.x * 22.0 + uTime * 1.1) * 0.0005;

  vec4 col = texture2D(uMap, uv);
  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));

  // Warm fire tint — shift highlights toward amber, cool blues down
  col.r = min(col.r * 1.08, 1.0);
  col.b *= 0.8;

  // Alpha = luma so dark bg is transparent, bright text carries light
  gl_FragColor = vec4(col.rgb, luma);
}
`;

export const ProjectText = ({ title, description }) => {
  const matRef = useRef();

  const mat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          uMap: { value: null },
          uTime: { value: 0 },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );
  matRef.current = mat;

  useEffect(() => {
    const canvas = buildGoboCanvas(title, description);
    const tex = new THREE.CanvasTexture(canvas);
    mat.uniforms.uMap.value = tex;
    return () => {
      tex.dispose();
      mat.uniforms.uMap.value = null;
    };
  }, [title, description, mat]);

  useEffect(() => () => mat.dispose(), [mat]);

  useFrame(({ clock }) => {
    mat.uniforms.uTime.value = clock.getElapsedTime();
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
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");

  const titleSize = Math.round(W * 0.07);
  const descSize = Math.round(W * 0.022);

  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  const maxW = Math.min(W * 0.65, 1400);
  const lines = wrapText(ctx, description, maxW);

  ctx.fillStyle = "#000000";
  ctx.fillRect(0, 0, W, H);

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Glow pass: soft halo behind the text
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = 80;
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(title, W / 2, H / 2 - titleSize * 0.9);

  ctx.shadowBlur = 40;
  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#dddddd";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, H / 2 + titleSize * 0.4 + i * (descSize * 1.5));
  }

  // Sharp pass on top
  ctx.shadowBlur = 0;
  ctx.font = `900 ${titleSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#ffffff";
  ctx.fillText(title, W / 2, H / 2 - titleSize * 0.9);

  ctx.font = `400 ${descSize}px system-ui, sans-serif`;
  ctx.fillStyle = "#dddddd";
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, H / 2 + titleSize * 0.4 + i * (descSize * 1.5));
  }
  ctx.restore();

  return canvas;
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    const test = current ? current + " " + word : word;
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
