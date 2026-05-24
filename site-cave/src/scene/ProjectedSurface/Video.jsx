import { useEffect, useMemo, useRef } from 'react';
import { LinearFilter, ShaderMaterial, VideoTexture } from 'three';

const vertexShader = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

// Shadow-like shader: treats video as a fire-lit scene.
// Bright video areas pass light through; dark areas become shadow.
// Warm tint shifts colors toward amber/fire rather than neutral projection.
const fragmentShader = `
uniform sampler2D uMap;
varying vec2 vUv;

void main() {
  vec4 col = texture2D(uMap, vUv);
  float luma = dot(col.rgb, vec3(0.299, 0.587, 0.114));

  // Fire-toned colour — boost reds, cool blues, slight green dip
  vec3 warm;
  warm.r = min(col.r * 1.15, 1.0);
  warm.g = col.g * 0.92;
  warm.b = col.b * 0.65;

  // Alpha: brighter areas let more light through (shadow-like gobo behaviour)
  gl_FragColor = vec4(warm, luma * 0.85);
}
`;

export const Video = () => {
  const meshRef = useRef();

  const mat = useMemo(
    () =>
      new ShaderMaterial({
        uniforms: {
          uMap: { value: null },
        },
        vertexShader,
        fragmentShader,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  useEffect(() => {
    const vid = document.createElement('video');
    vid.src = '/video.mp4';
    vid.loop = true;
    vid.muted = true;
    vid.playsInline = true;
    vid.crossOrigin = 'anonymous';

    const tex = new VideoTexture(vid);
    tex.minFilter = LinearFilter;
    mat.uniforms.uMap.value = tex;

    const onPlaying = () => {
      if (meshRef.current) meshRef.current.visible = true;
    };
    vid.addEventListener('playing', onPlaying);
    vid.play().catch(console.error);

    return () => {
      vid.removeEventListener('playing', onPlaying);
      vid.pause();
      vid.src = '';
      tex.dispose();
      mat.uniforms.uMap.value = null;
    };
  }, [mat]);

  useEffect(() => () => mat.dispose(), [mat]);

  return (
    <mesh ref={meshRef} renderOrder={0} visible={false}>
      <planeGeometry args={[2, 1]} />
      <primitive object={mat} attach="material" />
    </mesh>
  );
};
