import { memo, useEffect } from 'react';
import { useGLTF } from '@react-three/drei';
import { folder, useControls } from 'leva';
import { SCENE_CONFIG as C } from '../config';

const MODEL = '/models/wall.glb';

useGLTF.preload(MODEL);

export const Wall = memo(() => {
  const { wallX, wallY, wallZ, wallScale, wallRotX } = useControls({
    Wall: folder({
      wallX: { value: C.wallX, min: -5, max: 5, step: 0.01 },
      wallY: { value: C.wallY, min: -5, max: 5, step: 0.01 },
      wallZ: { value: C.wallZ, min: -10, max: 2, step: 0.01 },
      wallScale: { value: C.wallScale, min: 0.05, max: 5, step: 0.01 },
      wallRotX: { value: C.wallRotX, min: -Math.PI, max: Math.PI, step: 0.01 },
    }),
  });

  const { scene } = useGLTF(MODEL);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthTest = true;
          child.material.depthWrite = true;
          if (child.material.normalScale) child.material.normalScale.set(0.12, 0.12);
          if (child.material.roughness != null) child.material.roughness = 0.42;
        }
      }
    });
  }, [scene]);

  return (
    <primitive
      object={scene}
      position={[wallX, -1 + wallY, -2 + wallZ]}
      scale={0.25 + wallScale}
      rotation={[wallRotX, Math.PI, 0]}
    />
  );
});
