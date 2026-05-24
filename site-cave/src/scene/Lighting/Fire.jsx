import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import {
  Color,
  DataTexture,
  LinearFilter,
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  RGBAFormat,
  RepeatWrapping,
  Scene,
  ShaderMaterial,
  WebGLRenderTarget,
} from 'three';
import { SCENE_CONFIG as C } from '../config';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

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

export function Fire() {
  const { sunX, sunY, sunZ, fireIntensity, flameIntensity, flameAngle, flamePenumbra } =
    useControls({
      Fire: folder({
        sunX: { value: C.sunX, min: -5, max: 5, step: 0.01 },
        sunY: { value: C.sunY, min: -5, max: 5, step: 0.01 },
        sunZ: { value: C.sunZ, min: -5, max: 5, step: 0.01 },
        fireIntensity: { value: C.fireIntensity, min: 0, max: 40, step: 0.5 },
        flameIntensity: { value: C.flameIntensity, min: 0, max: 60, step: 0.5 },
        flameAngle: { value: C.flameAngle, min: 0.05, max: 1.4, step: 0.01 },
        flamePenumbra: { value: C.flamePenumbra, min: 0, max: 1, step: 0.01 },
      }),
    });

  const spotRef = useRef();
  const targetRef = useRef();

  const gpu = useRef(null);
  if (!gpu.current) {
    const noiseTex = makeNoiseTex();
    const target = new WebGLRenderTarget(512, 512, {
      minFilter: LinearFilter,
      magFilter: LinearFilter,
    });
    const scene = new Scene();
    scene.background = new Color(0x000000);
    const cam = new OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    cam.position.set(0, 0, 5);
    const mat = new ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uNoise: { value: noiseTex },
      },
      vertexShader,
      fragmentShader,
    });
    const geo = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geo, mat);
    scene.add(mesh);
    gpu.current = { noiseTex, target, scene, cam, mat, geo };
  }

  useEffect(() => {
    const spot = spotRef.current;
    const tgt = targetRef.current;
    if (!spot || !tgt) return;
    spot.target = tgt;
    tgt.updateMatrixWorld();
  }, []);

  useEffect(
    () => () => {
      const { target, mat, noiseTex, geo } = gpu.current ?? {};
      target?.dispose();
      mat?.dispose();
      noiseTex?.dispose();
      geo?.dispose();
    },
    [],
  );

  useFrame(({ gl, clock }) => {
    const { target, scene, cam, mat } = gpu.current ?? {};
    if (!target) return;
    mat.uniforms.uTime.value = clock.getElapsedTime();
    const prev = gl.autoClear;
    gl.autoClear = true;
    gl.setRenderTarget(target);
    gl.render(scene, cam);
    gl.setRenderTarget(null);
    gl.autoClear = prev;
  });

  const position = [sunX, sunY, sunZ];

  return (
    <>
      <group ref={targetRef} position={[0, 0, 0]} />
      <spotLight
        ref={spotRef}
        position={position}
        intensity={flameIntensity}
        angle={flameAngle}
        penumbra={flamePenumbra}
        map={gpu.current?.target.texture}
        color="#ff7c1a"
        distance={16}
        decay={2}
      />
      <pointLight
        position={position}
        intensity={fireIntensity}
        color="#ff6a00"
        distance={8}
        decay={2}
        castShadow
        shadow-mapSize={[512, 512]}
      />
    </>
  );
}
