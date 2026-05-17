import { useRef, useMemo, useEffect } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useTexture } from '@react-three/drei'

// ─────────────────────────────────────────────────────────────────────────────
//  CPU value noise (used once during instance scatter)
// ─────────────────────────────────────────────────────────────────────────────
function cpuVnoise(x, z) {
  const ix = Math.floor(x), iz = Math.floor(z)
  const fx = x - ix,        fz = z - iz
  const ux = fx * fx * (3 - 2 * fx)
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
//  Blade geometry  —  Now flat at z=0. 
//  All organic bending/twisting happens in the shader for instance uniqueness.
// ─────────────────────────────────────────────────────────────────────────────
function buildBladeGeometry(segments = 8) {
  const positions = [], normals = [], uvs = [], indices = []
  const BASE_W = 0.045 // Slightly narrower width for closer realism
  const H      = 1.0

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const y = t * H
    // Tapering curve: realistic grass blade silhouette
    const w = BASE_W * Math.pow(1.0 - t, 0.7) 

    positions.push(-w, y, 0,   w, y, 0)
    normals.push(0, 0, 1,   0, 0, 1)
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
  geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────────────────────────────────────
//  Vertex shader
//  • Adds unique organic curvature, lean, and twisting per individual instance
// ─────────────────────────────────────────────────────────────────────────────
const VERT = /* glsl */`
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
  vT = uv.y;
  vUv = uv;

  vec4 wRoot  = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  vWorldRoot  = wRoot.xyz;

  // Generate unique attributes per blade based on root position
  float randPhase = hash21(wRoot.xz) * 6.2832;
  float randCurvature = 0.15 + hash21(wRoot.xz + vec2(1.0, 2.0)) * 0.35;
  float randTwist = (hash21(wRoot.xz + vec2(3.4, 1.2)) - 0.5) * 1.8;
  float randLean = (hash21(wRoot.xz + vec2(5.6, 7.8)) - 0.5) * 0.25;

  vec3 pos = position;

  // 1. Apply unique twisting along the blade axis (uv.y)
  float twistAngle = randTwist * uv.y;
  float cosA = cos(twistAngle);
  float sinA = sin(twistAngle);
  float origX = pos.x;
  pos.x = origX * cosA - pos.z * sinA;
  pos.z = origX * sinA + pos.z * cosA;

  // 2. Apply unique permanent forward/sideways growth curvature (quadratic mask)
  float t2 = uv.y * uv.y;
  pos.z += randCurvature * t2;
  pos.x += randLean * t2;

  // 3. Two-octave fluid dynamic wind
  vec2 wc = wRoot.xz * 0.35 + uTime * uWindDir * 0.18;
  float w1 = vnoise(wc)               * 2.0 - 1.0;
  float w2 = vnoise(wc * 2.1 + 1.4)  * 2.0 - 1.0;

  pos.x += sin(uTime * 1.3 + randPhase + w1 * 2.0) * uWindStrength * t2;
  pos.z += cos(uTime * 0.9 + randPhase * 0.6 + w2 * 1.5) * uWindStrength * 0.5 * t2;

  // Pass transformed normal and view positions for shading calculations
  vec4 mvPosition = modelViewMatrix * instanceMatrix * vec4(pos, 1.0);
  vNormal = normalize(normalMatrix * mat3(instanceMatrix) * normal);
  vViewPosition = -mvPosition.xyz;

  gl_Position = projectionMatrix * mvPosition;
}
`

// ─────────────────────────────────────────────────────────────────────────────
//  Fragment shader
//  • Generates high-frequency micro-vein texture procedurally
//  • Includes fake subsurface scattering (backlight glow) & edge lighting
// ─────────────────────────────────────────────────────────────────────────────
const FRAG = /* glsl */`
precision highp float;

uniform vec3 uColorRoot;
uniform vec3 uColorMid;
uniform vec3 uColorTip;
uniform vec3 uLightDirection; // Normalized world space light direction

varying float vT;
varying vec2  vUv;
varying vec3  vWorldRoot;
varying vec3  vNormal;
varying vec3  vViewPosition;

float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

void main() {
  // 1. Natural base color gradient
  vec3 col = vT < 0.4
    ? mix(uColorRoot, uColorMid, vT * 2.5)
    : mix(uColorMid,  uColorTip, (vT - 0.4) * 1.666);

  // 2. Micro-surface texture detailing: Procedural blade fibers/veins
  float veinNoise = fract(sin(vUv.x * 40.0 + hash21(vec2(vWorldRoot.x)) * 10.0));
  float fineStructure = smoothstep(0.4, 0.6, veinNoise) * 0.12;
  col -= fineStructure * (1.0 - vT * 0.5); // Fibers are more defined near roots

  // 3. Subtle noise patches across the field (simulates dead or highly hydrated spots)
  float patchNoise = hash21(floor(vWorldRoot.xz * 2.5));
  col *= mix(0.88, 1.05, patchNoise);

  // 4. Fine-tuned lighting calculation
  vec3 N = normalize(vNormal);
  vec3 L = normalize(uLightDirection);
  vec3 V = normalize(vViewPosition);

  float diffuse = max(dot(N, L), 0.0);
  
  // Fake Subsurface Scattering (Backlighting glow through translucent tissue)
  float SSS = max(dot(-V, L), 0.0) * pow(1.0 - diffuse, 2.0);
  vec3 translucentGlow = uColorTip * SSS * 0.45 * smoothstep(0.2, 1.0, vT);

  // Combine components with Ambient Occlusion crushing base shadows
  float fakeAO = smoothstep(0.0, 0.35, vT) * 0.6 + 0.4;
  
  vec3 ambient = col * 0.45;
  vec3 directDiffuse = col * diffuse * 0.75;
  
  col = (ambient + directDiffuse) * fakeAO + translucentGlow;

  // 5. Delicate tip alpha feathering to kill hard aliased pixels
  float alpha = 1.0 - smoothstep(0.92, 1.0, vT) * 0.85;

  gl_FragColor = vec4(col, alpha);
}
`

// ─────────────────────────────────────────────────────────────────────────────
//  RealisticFloor Component
// ─────────────────────────────────────────────────────────────────────────────
export function Ground({
  strands = 85000, // Boosted count for compact lush look

  groundSize    = 5, // Tighter bounds = higher density screen real estate
  groundY       = -0.5,
  textureRepeat = 3, 

  heightMin  = 0.14,
  heightMax  = 0.38,

  windStrength = 0.12,
  windDir      = [1, 0.3],

  colorRoot = '#0d1807', // Dark damp soil shadow green
  colorMid  = '#2e5917', // Saturated leaf green
  colorTip  = '#76b833', // Sunny, translucent grass tip
}) {
  const grassRef = useRef()

  const textures = useTexture({
    map:          '/textures/Ground068_2K-JPG_Color.jpg',
    normalMap:    '/textures/Ground068_2K-JPG_NormalGL.jpg',
    roughnessMap: '/textures/Ground068_2K-JPG_Roughness.jpg',
    aoMap:        '/textures/Ground068_2K-JPG_AmbientOcclusion.jpg',
  })

  useMemo(() => {
    Object.values(textures).forEach(t => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping
      t.repeat.set(textureRepeat, textureRepeat)
    })
  }, [textures, textureRepeat])

  const bladeGeo = useMemo(() => buildBladeGeometry(8), [])

  const bladeMat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader:   VERT,
    fragmentShader: FRAG,
    uniforms: {
      uTime:           { value: 0 },
      uWindStrength:   { value: windStrength },
      uWindDir:        { value: new THREE.Vector2(...windDir).normalize() },
      uColorRoot:      { value: new THREE.Color(colorRoot) },
      uColorMid:       { value: new THREE.Color(colorMid) },
      uColorTip:       { value: new THREE.Color(colorTip) },
      // Directs light interaction equations (adjust to match your main scene light position)
      uLightDirection: { value: new THREE.Vector3(1.0, 1.5, 1.0).normalize() }
    },
    side:        THREE.DoubleSide,
    transparent: true,
    depthWrite:  true,
  }), [windStrength, colorRoot, colorMid, colorTip])

  useEffect(() => {
    const mesh = grassRef.current
    if (!mesh) return

    const dummy = new THREE.Object3D()

    for (let i = 0; i < strands; i++) {
      const x = (Math.random() - 0.5) * groundSize
      const z = (Math.random() - 0.5) * groundSize

      const density  = cpuVnoise(x * 1.2 + 200, z * 1.2 + 200)
      const detail   = cpuVnoise(x * 3.5,        z * 3.5)       

      const noiseVal = density * 0.7 + detail * 0.3
      const h = THREE.MathUtils.lerp(heightMin, heightMax, noiseVal)

      dummy.position.set(x, groundY, z)

      // Random heading around the clock
      dummy.rotation.y = Math.random() * Math.PI * 2
      // Give each a tiny baseline lean prior to shader execution
      dummy.rotation.x = (Math.random() - 0.5) * 0.12

      // Non-uniform scaling: Makes blades look naturally thin and unique
      const aspectThick = 0.75 + Math.random() * 0.4
      dummy.scale.set(aspectThick, h, aspectThick)

      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)
    }

    mesh.instanceMatrix.needsUpdate = true
  }, [strands, groundSize, heightMin, heightMax, groundY])

  useFrame(({ clock }) => {
    bladeMat.uniforms.uTime.value = clock.getElapsedTime()
  })

  return (
    <group>
      {/* ── Textured Soil Ground Base ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
        <planeGeometry args={[groundSize, groundSize, 32, 32]} />
        <meshStandardMaterial {...textures} roughness={0.95} metalness={0.0} />
      </mesh>

      {/* ── High Fidelity Grass Instances ── */}
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