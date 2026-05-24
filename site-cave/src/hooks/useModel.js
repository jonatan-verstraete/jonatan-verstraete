import { useGLTF, useTexture } from '@react-three/drei';
import { LinearFilter, RepeatWrapping } from 'three';

/**
 * Load a GLB model with Draco support.
 * Draco decoder is served from /draco/ (local, no CDN).
 */
export function useModel(path) {
  return useGLTF(path);
}

/**
 * Preload a GLB so it's ready before the component mounts.
 */
export function preloadModel(path) {
  useGLTF.preload(path);
}

/**
 * Load a set of PBR textures and configure repeat wrapping + tiling.
 * @param {object} paths - { map, normalMap, roughnessMap, aoMap, ... }
 * @param {number} repeat - UV repeat count (default 1)
 */
export function usePBRTextures(paths, repeat = 1) {
  const textures = useTexture(paths);
  Object.values(textures).forEach((t) => {
    if (!t) return;
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(repeat, repeat);
    t.minFilter = LinearFilter;
  });
  return textures;
}
