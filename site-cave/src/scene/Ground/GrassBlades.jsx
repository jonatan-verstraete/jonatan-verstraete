import { useRef, useMemo, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { cpuVnoise } from "./noiseUtils";

// ─────────────────────────────────────────────────────────────────────────────
//  Blade geometry — flat quad-strip. Organic bend/twist lives in the shader.
// ─────────────────────────────────────────────────────────────────────────────
function buildBladeGeometry(segments = 8) {
  const positions = [], normals = [], uvs = [], indices = [];
  const BASE_W = 0.045;
  const H = 1.0;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * H;
    const w = BASE_W * Math.pow(1.0 - t, 0.7);

    positions.push(-w, y, 0, w, y, 0);
    normals.push(0, 0, 1, 0, 0, 1);
    uvs.push(0, t, 1, t);

    if (i < segments) {
      const b = i * 2;
      indices.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geo.setAttribute("normal",   new THREE.Float32BufferAttribute(normals,   3));
  geo.setAttribute("uv",       new THREE.Float32BufferAttribute(uvs,       2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

// ─────────────────────────────────────────────────────────────────────────────
//  Vertex shader
//  Per-blade: unique twist, growth curvature, lean + two-octave fluid wind
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uWindStrength;
uniform vec2  uWindDir;

varying float vT;
varying vec2  vUv;
varying vec3  vWorldRoot;
varying vec3  vNormal;
varying vec3  vViewPosition;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash21(i),             hash21(i + vec2(1,0)), f.x),
    mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x),
    f.y);
}

void main() {
  vT  = uv.y;
  vUv = uv;

  vec4 wRoot = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vWorldRoot = wRoot.xyz;

  float randPhase     = hash21(wRoot.xz) * 6.2832;
  float randCurvature = 0.15 + hash21(wRoot.xz + vec2(1.0, 2.0)) * 0.35;
  float randTwist     = (hash21(wRoot.xz + vec2(3.4, 1.2)) - 0.5) * 1.8;
  float randLean      = (hash21(wRoot.xz + vec2(5.6, 7.8)) - 0.5) * 0.25;

  vec3 pos = position;

  // Unique per-blade twist
  float twistAngle = randTwist * uv.y;
  float cosA = cos(twistAngle), sinA = sin(twistAngle);
  float origX = pos.x;
  pos.x =  origX * cosA - pos.z * sinA;
  pos.z =  origX * sinA + pos.z * cosA;

  // Permanent growth lean + curvature
  float t2 = uv.y * uv.y;
  pos.z += randCurvature * t2;
  pos.x += randLean * t2;

  // Two-octave fluid wind
  vec2  wc = wRoot.xz * 0.35 + uTime * uWindDir * 0.18;
  float w1 = vnoise(wc)              * 2.0 - 1.0;
  float w2 = vnoise(wc * 2.1 + 1.4) * 2.0 - 1.0;

  pos.x += sin(uTime * 1.3 + randPhase + w1 * 2.0)              * uWindStrength       * t2;
  pos.z += cos(uTime * 0.9 + randPhase * 0.6 + w2 * 1.5)        * uWindStrength * 0.5 * t2;

  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  vNormal         = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vViewPosition   = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  Fragment shader
//  Procedural micro-veins, fake SSS backlight, AO root crush, tip feather
// ─────────────────────────────────────────────────────────────────────────────
const FRAG = /* glsl */ `
precision highp float;

uniform vec3 uColorRoot;
uniform vec3 uColorMid;
uniform vec3 uColorTip;
uniform vec3 uLightDirection;

varying float vT;
varying vec2  vUv;
varying vec3  vWorldRoot;
varying vec3  vNormal;
varying vec3  vViewPosition;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  vec3 col = vT < 0.4
    ? mix(uColorRoot, uColorMid, vT * 2.5)
    : mix(uColorMid,  uColorTip, (vT - 0.4) * 1.666);

  // Micro-surface fibers/veins
  float veinNoise    = fract(sin(vUv.x * 40.0 + hash21(vec2(vWorldRoot.x)) * 10.0));
  float fineStructure = smoothstep(0.4, 0.6, veinNoise) * 0.12;
  col -= fineStructure * (1.0 - vT * 0.5);

  // Per-patch luminance variation
  float patchNoise = hash21(floor(vWorldRoot.xz * 2.5));
  col *= mix(0.88, 1.05, patchNoise);

  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDirection);
  vec3 V = normalize(vViewPosition);

  float diffuse = max(dot(N, L), 0.0);
  float SSS     = max(dot(-V, L), 0.0) * pow(1.0 - diffuse, 2.0);
  vec3 translucentGlow = uColorTip * SSS * 0.45 * smoothstep(0.2, 1.0, vT);

  float fakeAO = smoothstep(0.0, 0.35, vT) * 0.6 + 0.4;
  col = (col * 0.45 + col * diffuse * 0.75) * fakeAO + translucentGlow;

  float alpha = 1.0 - smoothstep(0.92, 1.0, vT) * 0.85;
  gl_FragColor = vec4(col, alpha);
}
`;

// ─────────────────────────────────────────────────────────────────────────────
//  GrassBlades component
// ─────────────────────────────────────────────────────────────────────────────
export function GrassBlades({
  strands       = 85000,
  groundSize    = 6,
  groundY       = -0.5,
  heightMin     = 0.14,
  heightMax     = 0.38,
  windStrength  = 0.12,
  windDir       = [1, 0.3],
  colorRoot     = "#0d1807",
  colorMid      = "#2e5917",
  colorTip      = "#76b833",
}) {
  const meshRef = useRef();

  const bladeGeo = useMemo(() => buildBladeGeometry(8), []);

  const bladeMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader:   VERT,
        fragmentShader: FRAG,
        uniforms: {
          uTime:           { value: 0 },
          uWindStrength:   { value: windStrength },
          uWindDir:        { value: new THREE.Vector2(...windDir).normalize() },
          uColorRoot:      { value: new THREE.Color(colorRoot) },
          uColorMid:       { value: new THREE.Color(colorMid) },
          uColorTip:       { value: new THREE.Color(colorTip) },
          uLightDirection: { value: new THREE.Vector3(1, 1.5, 1).normalize() },
        },
        side:        THREE.DoubleSide,
        transparent: true,
        depthWrite:  true,
      }),
    [windStrength, colorRoot, colorMid, colorTip],
  );

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const dummy = new THREE.Object3D();

    for (let i = 0; i < strands; i++) {
      const x = (Math.random() - 0.5) * groundSize;
      const z = (Math.random() - 0.5) * groundSize;

      const density  = cpuVnoise(x * 1.2 + 200, z * 1.2 + 200);
      const detail   = cpuVnoise(x * 3.5,        z * 3.5);
      const noiseVal = density * 0.7 + detail * 0.3;
      const h        = THREE.MathUtils.lerp(heightMin, heightMax, noiseVal);

      dummy.position.set(x, groundY, z);
      dummy.rotation.y = Math.random() * Math.PI * 2;
      dummy.rotation.x = (Math.random() - 0.5) * 0.12;
      const thick = 0.75 + Math.random() * 0.4;
      dummy.scale.set(thick, h, thick);

      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }

    mesh.instanceMatrix.needsUpdate = true;
  }, [strands, groundSize, heightMin, heightMax, groundY]);

  useEffect(() => () => { bladeGeo.dispose(); bladeMat.dispose(); }, [bladeGeo, bladeMat]);

  useFrame(({ clock }) => {
    bladeMat.uniforms.uTime.value = clock.getElapsedTime();
  });

  return (
    <instancedMesh
      ref={meshRef}
      args={[bladeGeo, bladeMat, strands]}
      frustumCulled={false}
      castShadow
      receiveShadow
    />
  );
}
