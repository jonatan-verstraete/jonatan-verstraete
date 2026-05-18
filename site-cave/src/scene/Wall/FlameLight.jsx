import { useRef, useMemo, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  DataTexture,
  RGBAFormat,
  RepeatWrapping,
  WebGLRenderTarget,
  LinearFilter,
  Scene,
  Color,
  OrthographicCamera,
  ShaderMaterial,
  PlaneGeometry,
  Mesh,
} from "three";

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Flame shader adapted from .keep/flame.shader (Shadertoy-style → GLSL ES3)
const fragmentShader = `
uniform float uTime;
uniform sampler2D uNoise;
varying vec2 vUv;

mat2 rotz(float a) {
  return mat2(cos(a), -sin(a), sin(a), cos(a));
}

float fbm(vec2 p) {
  float n = (texture2D(uNoise, p).r - 0.5) * 0.5;
  n += (texture2D(uNoise, p * 2.0).r - 0.5) * 0.25;
  n += (texture2D(uNoise, p * 4.0).r - 0.5) * 0.125;
  return n + 0.5;
}

void main() {
  vec2 _uv = vUv;
  vec2 uv = vUv - 0.5;
  vec2 centerUV = uv;

  float variationH = fbm(vec2(uTime * 0.3)) * 0.1;
  vec2 offset = vec2(0.0, -uTime * 0.15);

  float f = fbm(uv * 0.1 + offset);
  float l = max(0.1, length(uv));
  uv += rotz(((f - 0.5) / l) * smoothstep(-0.2, 0.4, _uv.y) * 0.45) * uv;

  float flame = 1.3 - length(uv.x) * 5.0;

  float blueflame = pow(max(0.0, flame * 0.9), 15.0);
  blueflame *= smoothstep(0.2, -1.0, _uv.y);
  blueflame /= (abs(uv.x * 2.0) + 0.001);
  blueflame = clamp(blueflame, 0.0, 1.0);

  flame *= smoothstep(1.0, variationH * 0.5, _uv.y);
  flame = clamp(flame, 0.0, 1.0);
  flame = pow(flame, 3.0);
  float denom = smoothstep(1.1, -0.1, _uv.y);
  flame /= max(denom, 0.0001);
  flame = clamp(flame, 0.0, 1.0);

  vec4 col = mix(vec4(1.0, 1.0, 0.0, 0.0), vec4(1.0, 1.0, 0.6, 0.0), flame);
  col = mix(vec4(1.0, 0.0, 0.0, 0.0), col, smoothstep(0.0, 1.6, flame));
  vec4 fragColor = col;

  vec4 bluecolor = mix(vec4(0.0, 0.0, 1.0, 0.0), fragColor, 0.95);
  fragColor = mix(fragColor, bluecolor, blueflame);

  fragColor *= flame;
  fragColor.a = flame;

  float haloSize = 0.5;
  float centerL = max(0.0, 1.0 - length(centerUV + vec2(0.0, 0.1)) / haloSize);
  vec4 halo = vec4(0.8, 0.3, 0.3, 0.0) * fbm(vec2(uTime * 0.035)) * centerL + 0.02;
  fragColor = mix(halo, fragColor, fragColor.a);

  gl_FragColor = clamp(fragColor, 0.0, 1.0);
}
`;

function makeNoiseTex(size = 256) {
  const data = new Uint8Array(size * size * 4);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 255) | 0;
  const tex = new DataTexture(data, size, size, RGBAFormat);
  tex.wrapS = tex.wrapT = RepeatWrapping;
  tex.needsUpdate = true;
  return tex;
}

export function FlameLight({ position, intensity, angle, penumbra = 0.65 }) {
  const spotRef = useRef();
  const targetRef = useRef();

  const noiseTex = useMemo(() => makeNoiseTex(), []);

  const flameTarget = useMemo(
    () =>
      new WebGLRenderTarget(512, 512, {
        minFilter: LinearFilter,
        magFilter: LinearFilter,
      }),
    [],
  );

  const [flameScene, flameCamera] = useMemo(() => {
    const s = new Scene();
    s.background = new Color(0x000000);
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.set(0, 0, 5);
    return [s, cam];
  }, []);

  const flameMat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uTime: { value: 0 },
          uNoise: { value: noiseTex },
        },
        vertexShader,
        fragmentShader,
      }),
    [noiseTex],
  );

  useEffect(() => {
    const geo = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geo, flameMat);
    flameScene.add(mesh);
    return () => {
      flameScene.remove(mesh);
      geo.dispose();
    };
  }, [flameScene, flameMat]);

  useEffect(() => {
    const spot = spotRef.current;
    const tgt = targetRef.current;
    if (!spot || !tgt) return;
    spot.target = tgt;
    tgt.updateMatrixWorld();
  }, []);

  useEffect(
    () => () => {
      flameTarget.dispose();
      flameMat.dispose();
      noiseTex.dispose();
    },
    [flameTarget, flameMat, noiseTex],
  );

  useFrame(({ gl, clock }) => {
    flameMat.uniforms.uTime.value = clock.getElapsedTime();
    const prev = gl.autoClear;
    gl.autoClear = true;
    gl.setRenderTarget(flameTarget);
    gl.render(flameScene, flameCamera);
    gl.setRenderTarget(null);
    gl.autoClear = prev;
  });

  return (
    <>
      <group ref={targetRef} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        position={position}
        intensity={intensity}
        angle={angle}
        penumbra={penumbra}
        map={flameTarget.texture}
        color="#ff7c1a"
        distance={16}
        decay={2}
      />
    </>
  );
}
