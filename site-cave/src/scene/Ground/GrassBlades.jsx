import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  MeshStandardMaterial,
  Vector2,
} from 'three';
import { cpuVnoise } from './noiseUtils';

function buildBladeGeometry(segments = 8) {
  const positions = [],
    normals = [],
    uvs = [],
    indices = [];
  const BASE_W = 0.045;
  const H = 1.0;

  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * H;
    const w = BASE_W * Math.pow(1.0 - t, 0.7);

    // Geometry tapers to 0 at the tip, eliminating the need for alpha transparency
    positions.push(-w, y, 0, w, y, 0);
    normals.push(0, 0, 1, 0, 0, 1);
    uvs.push(0, t, 1, t);

    if (i < segments) {
      const b = i * 2;
      indices.push(b, b + 1, b + 2, b + 2, b + 1, b + 3);
    }
  }

  const geo = new BufferGeometry();
  geo.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geo.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  geo.setAttribute('uv', new Float32BufferAttribute(uvs, 2));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  return geo;
}

export function GrassBlades({
  strands = 85000,
  groundSize = 6,
  groundY = -0.5,
  heightMin = 0.14,
  heightMax = 0.38,
  windStrength = 0.1,
  windDir = [1, 0.3],
  // Muted, dark night palette. Let the moonlight and firelight do the heavy lifting!
  colorRoot = '#020501',
  colorMid = '#12200a',
  colorTip = '#2c4220',
}) {
  const meshRef = useRef();
  const bladeGeo = useMemo(() => buildBladeGeometry(8), []);

  const bladeMat = useMemo(() => {
    // Standard PBR Material allows automatic interaction with Fog, PointLights, and HDRIs
    const mat = new MeshStandardMaterial({
      roughness: 0.35, // Low roughness to catch sharp light reflections
      metalness: 0.1,
      side: DoubleSide,
      transparent: false, // Disabling alpha blending prevents sorting glitches at night
    });

    mat.onBeforeCompile = (shader) => {
      // 1. Inject Uniforms
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uWindStrength = { value: windStrength };
      shader.uniforms.uWindDir = {
        value: new Vector2(...windDir).normalize(),
      };
      shader.uniforms.uColorRoot = { value: new Color(colorRoot) };
      shader.uniforms.uColorMid = { value: new Color(colorMid) };
      shader.uniforms.uColorTip = { value: new Color(colorTip) };

      mat.userData.shader = shader;

      // 2. Vertex Shader Injection (Wind Physics)
      shader.vertexShader =
        `
        uniform float uTime;
        uniform float uWindStrength;
        uniform vec2  uWindDir;
        varying float vT;
        varying vec3  vLocalPos;
        varying vec3  vWorldRootPos;

        float hash21(vec2 p) {
          return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
        }
        float vnoise(vec2 p) {
          vec2 i = floor(p), f = fract(p);
          f = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash21(i), hash21(i + vec2(1,0)), f.x), mix(hash21(i + vec2(0,1)), hash21(i + vec2(1,1)), f.x), f.y);
        }
      ` + shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `
        #include <begin_vertex>
        vT = uv.y;
        vLocalPos = position;

        vec3 wRoot = vec3(0.0);
        #ifdef USE_INSTANCING
          wRoot = instanceMatrix[3].xyz;
        #endif
        vWorldRootPos = wRoot;

        float randPhase     = hash21(wRoot.xz) * 6.2832;
        float randCurvature = 0.15 + hash21(wRoot.xz + vec2(1.0, 2.0)) * 0.35;
        float randTwist     = (hash21(wRoot.xz + vec2(3.4, 1.2)) - 0.5) * 1.8;
        float randLean      = (hash21(wRoot.xz + vec2(5.6, 7.8)) - 0.5) * 0.25;

        float twistAngle = randTwist * uv.y;
        float cosA = cos(twistAngle), sinA = sin(twistAngle);
        float origX = transformed.x;
        transformed.x =  origX * cosA - transformed.z * sinA;
        transformed.z =  origX * sinA + transformed.z * cosA;

        float t2 = uv.y * uv.y;
        transformed.z += randCurvature * t2;
        transformed.x += randLean * t2;

        vec2 wc = wRoot.xz * 0.35 + uTime * uWindDir * 0.18;
        float w1 = vnoise(wc)              * 2.0 - 1.0;
        float w2 = vnoise(wc * 2.1 + 1.4) * 2.0 - 1.0;

        transformed.x += sin(uTime * 1.3 + randPhase + w1 * 2.0)       * uWindStrength       * t2;
        transformed.z += cos(uTime * 0.9 + randPhase * 0.6 + w2 * 1.5) * uWindStrength * 0.5 * t2;
        `,
      );

      // 3. Fragment Shader Injection (Coloring & Moonlight Glimmer)
      shader.fragmentShader =
        `
        varying float vT;
        varying vec3  vLocalPos;
        varying vec3  vWorldRootPos;
        uniform vec3  uColorRoot;
        uniform vec3  uColorMid;
        uniform vec3  uColorTip;

        float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
        float hash31(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
      ` + shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <color_fragment>`,
        `
        #include <color_fragment>

        vec3 grassCol = vT < 0.4
          ? mix(uColorRoot, uColorMid, vT * 2.5)
          : mix(uColorMid,  uColorTip, (vT - 0.4) * 1.666);

        float veinNoise = fract(sin(vLocalPos.x * 40.0 + hash21(vec2(vWorldRootPos.x)) * 10.0));
        float fineStructure = smoothstep(0.4, 0.6, veinNoise) * 0.12;
        grassCol -= fineStructure * (1.0 - vT * 0.5);

        // Grounding variation + Organic dead grass patches (approx 10%)
        float patchNoise = hash21(floor(vWorldRootPos.xz * 2.0));
        vec3 dryGrassColor = vec3(0.42, 0.36, 0.24); 
        float dryMix = smoothstep(0.78, 1.0, patchNoise);
        grassCol = mix(grassCol, dryGrassColor, dryMix * 0.65);
        grassCol *= mix(0.82, 1.08, patchNoise);

        // Soft root darkening (Fake Ambient Occlusion)
        float fakeAO = smoothstep(0.0, 0.35, vT) * 0.75 + 0.25;
        diffuseColor.rgb = grassCol * fakeAO;
        `,
      );

      shader.fragmentShader = shader.fragmentShader.replace(
        `#include <emissivemap_fragment>`,
        `
        #include <emissivemap_fragment>

        // High frequency micro-noise mapping for dynamic dew/crystalline glimmer
        vec3 sparkleSeed = (vWorldRootPos + vLocalPos) * 160.0;
        float sparkleNoise = hash31(floor(sparkleSeed));
        
        // Isolate tiny percentages of the surface to act as sparkle points
        float sparkleThresh = 0.994; 
        if (sparkleNoise > sparkleThresh && vT > 0.4) {
          vec3 normalDir = normalize(vNormal);
          vec3 viewDir = normalize(vViewPosition);
          float viewCatch = max(dot(normalDir, viewDir), 0.0);
          
          // Pure white-blue moonlight flash effect injected into emissive channel
          // Moves with the wind and camera perspective natively
          vec3 sparkleColor = vec3(0.85, 0.95, 1.0) * 3.5 * smoothstep(sparkleThresh, 1.0, sparkleNoise);
          totalEmissiveRadiance += sparkleColor * viewCatch * smoothstep(0.0, 0.35, vT);
        }
        `,
      );
    };

    return mat;
  }, [windStrength, colorRoot, colorMid, colorTip]);

  useEffect(
    () => () => {
      bladeGeo.dispose();
      bladeMat.dispose();
    },
    [bladeGeo, bladeMat],
  );

  useFrame(({ clock }) => {
    if (bladeMat.userData.shader) {
      bladeMat.userData.shader.uniforms.uTime.value = clock.getElapsedTime();
    }
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
