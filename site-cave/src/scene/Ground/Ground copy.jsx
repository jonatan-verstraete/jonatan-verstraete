import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

// ─────────────────────────────────────────────────────────────────────────────
//  CPU value noise  (replaces perlin.js — used once during instance scatter)
//  Returns [0, 1] for any (x, z) pair
// ─────────────────────────────────────────────────────────────────────────────
function cpuVnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z)
  const fx = x - ix,        fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)   // smoothstep
  const uz = fz * fz * (3 - 2 * fz)
  const h = (px, pz) => {
    const n = Math.sin(px * 127.1 + pz * 311.7) * 43758.5453
    return n - Math.floor(n)
  }
  return (
    h(ix,   iz)   * (1 - ux) * (1 - uz) +
    h(ix+1, iz)   *      ux  * (1 - uz) +
    h(ix,   iz+1) * (1 - ux) *      uz  +
    h(ix+1, iz+1) *      ux  *      uz
  )
}

// ─────────────────────────────────────────────────────────────────────────────
//  Blade geometry  —  tapered quad-strip, UV.y = height fraction (0→1)
//  segments=7 gives 7 quad rows: smooth enough for medium close-up deform
// ─────────────────────────────────────────────────────────────────────────────
function buildBladeGeometry(segments = 7) {
  const positions = [], normals = [], uvs = [], indices = []
  const BASE_W = 0.055   // half-width at root, scaled per instance
  const H      = 1.0     // height, scaled per instance

  for (let i = 0; i <= segments; i++) {
    const t    = i / segments
    const y    = t * H
    const w    = BASE_W * (1.0 - t * 0.88)   // taper to near-point at tip
    const bend = t * t * 0.26                 // gentle quadratic forward lean

    positions.push(-w, y, bend,   w, y, bend)
    normals.push(0, bend * 0.5, 1.0,   0, bend * 0.5, 1.0)
    uvs.push(0, t,   1, t)

    if (i < segments) {
      const b = i * 2
      indices.push(b, b+1, b+2,   b+2, b+1, b+3)
    }
  }

  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geo.setAttribute('normal',   new THREE.Float32BufferAttribute(normals,   3))
  geo.setAttribute('uv',       new THREE.Float32BufferAttribute(uvs,       2))
  geo.setIndex(indices)
  geo.computeBoundingSphere()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
//  Vertex shader
//  • uv.y² mask keeps root pinned; tip displaces fully
//  • two octaves of value noise drift in wind direction
//  • per-instance hash gives each blade a unique phase
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`
precision highp float;

uniform float uTime;
uniform float uWindStrength;
uniform vec2  uWindDir;

varying float vT;          // height fraction  0=root  1=tip
varying vec3  vWorldRoot;  // blade world-root XZ (constant per instance)

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
  vT = uv.y;

  vec4 wRoot  = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vWorldRoot  = wRoot.xyz;

  // per-blade phase so neighbours never sync
  float phase = hash21(wRoot.xz) * 6.2832;

  // two-octave wind noise drifting across ground plane
  vec2 wc = wRoot.xz * 0.45 + uTime * uWindDir * 0.20;
  float w1 = vnoise(wc)               * 2.0 - 1.0;
  float w2 = vnoise(wc * 2.3 + 1.73) * 2.0 - 1.0;

  float t2 = uv.y * uv.y;   // quadratic mask

  vec3 pos = position;
  pos.x += sin(uTime * 1.5 + phase + w1 * 2.4) * uWindStrength       * t2;
  pos.z += cos(uTime * 1.1 + phase * 0.7 + w2 * 1.9) * uWindStrength * 0.45 * t2;

  gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
}
`

// ─────────────────────────────────────────────────────────────────────────────
//  Fragment shader
//  • 3-stop colour gradient root→mid→tip (matches Depth layer intent)
//  • fake AO crushes base into shadow
//  • per-blade luminance hash breaks instancing uniformity
//  • tip alpha fade for natural silhouettes
// ─────────────────────────────────────────────────────────────────────────────
const FRAG = /* glsl */`
precision highp float;

uniform vec3 uColorRoot;
uniform vec3 uColorMid;
uniform vec3 uColorTip;

varying float vT;
varying vec3  vWorldRoot;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // 3-stop gradient  (mirrors Gemini's Depth + WindLayer multiply)
  vec3 col = vT < 0.5
    ? mix(uColorRoot, uColorMid, vT * 2.0)
    : mix(uColorMid,  uColorTip, (vT - 0.5) * 2.0);

  // fake AO: roots stay dark even without environment lighting
  col *= smoothstep(0.0, 0.28, vT) * 0.55 + 0.45;

  // per-blade luminance variation  (±10%  subtle but kills tiling feel)
  col *= 0.90 + hash21(vWorldRoot.xz) * 0.20;

  // tip alpha fade
  float alpha = 1.0 - smoothstep(0.80, 1.0, vT) * 0.65;

  gl_FragColor = vec4(col, alpha);
}
`

// ─────────────────────────────────────────────────────────────────────────────
//  RealisticFloor
// ─────────────────────────────────────────────────────────────────────────────
export function Ground({
  strands = 75000,

  // ground
  groundSize    = 6,      // Gemini used 6×6 — good density for close-ups
  groundY       = -0.5,
  textureRepeat = 2,      // how many times the soil texture tiles

  // blade height
  heightMin  = 0.12,
  heightMax  = 0.32,

  // wind
  windStrength = 0.16,
  windDir      = [1, 0.5],

  // colours  (matches Gemini's #14220b root, #527e32 mid, bright tip)
  colorRoot = '#14220b',
  colorMid  = '#3d7a1a',
  colorTip  = '#8fcc3a',
}) {
  const grassRef = useRef()

  // ── Textures ───────────────────────────────────────────────────────────────
  const textures = useTexture({
    map:          '/textures/Ground068_2K-JPG_Color.jpg',
    normalMap:    '/textures/Ground068_2K-JPG_NormalGL.jpg',
    roughnessMap: '/textures/Ground068_2K-JPG_Roughness.jpg',
    aoMap:        '/textures/Ground068_2K-JPG_AmbientOcclusion.jpg',
  })

  // Set repeat once, not on every render
  useMemo(() => {
    Object.values(textures).forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(textureRepeat, textureRepeat)
    })
  }, [textures, textureRepeat])

  // ── Grass geometry (shared across all instances) ───────────────────────────
  const bladeGeo = useMemo(() => buildBladeGeometry(7), [])

  // ── Grass material ─────────────────────────────────────────────────────────
  const bladeMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime:         { value: 0 },
      uWindStrength: { value: windStrength },
      uWindDir:      { value: new THREE.Vector2(...windDir).normalize() },
      uColorRoot:    { value: new THREE.Color(colorRoot) },
      uColorMid:     { value: new THREE.Color(colorMid) },
      uColorTip:     { value: new THREE.Color(colorTip) },
    },
    side:        THREE.DoubleSide,
    transparent: true,
    depthWrite:  true,
  }), [windStrength, colorRoot, colorMid, colorTip])

  // ── Scatter instances — runs once, O(n), no per-frame CPU cost ─────────────
  useEffect(() => {
    const mesh = grassRef.current
    if (!mesh) return

    const dummy = new THREE.Object3D()

    for (let i = 0; i < strands; i++) {
      const x = (Math.random() - 0.5) * groundSize
      const z = (Math.random() - 0.5) * groundSize

      // ── density clumping via low-freq noise  (replaces Perlin.simplex3) ────
      //    cpuVnoise is [0,1]; scale×4 → 4 clumps across the field
      const density  = cpuVnoise(x * 0.8 + 100, z * 0.8 + 100)  // large clumps
      const detail   = cpuVnoise(x * 2.5,        z * 2.5)        // fine variation

      // scale: combine density + detail, map to [heightMin, heightMax]
      const noiseVal = density * 0.65 + detail * 0.35
      const h = THREE.MathUtils.lerp(heightMin, heightMax, noiseVal)

      dummy.position.set(x, groundY, z)

      // full azimuth rotation
      dummy.rotation.y = Math.random() * Math.PI * 2
      // slight tilt for organic spread (matches Gemini's rotation.x offset)
      dummy.rotation.x = (Math.random() - 0.5) * 0.18

      // non-uniform scale: Y slightly taller than XZ for a realistic blade aspect
      dummy.scale.set(h * 0.85, h, h * 0.85)

      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }, [strands, groundSize, heightMin, heightMax, groundY])

  // ── Animate wind ───────────────────────────────────────────────────────────
  useFrame(({ clock }) => {
    bladeMat.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <group>
      {/* ── Soil base  ──────────────────────────────────────────────────── */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, groundY, 0]}
        receiveShadow
      >
        <planeGeometry args={[groundSize, groundSize, 64, 64]} />
        <meshStandardMaterial
          {...textures}
          roughness={0.9}
          metalness={0.0}
        />
      </mesh>

      {/* ── Grass blades  ───────────────────────────────────────────────── */}
      <instancedMesh
        ref={grassRef}
        args={[bladeGeo, bladeMat, strands]}
        frustumCulled={false}
        castShadow
        receiveShadow
      />
    </group>
  )
}