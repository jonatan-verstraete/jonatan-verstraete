import { useEffect, useRef } from 'react';
import { useGLTF } from '@react-three/drei';
import { InstancedMesh, MathUtils, Object3D } from 'three';
import { cpuVnoise } from './noiseUtils';

export function GrassShrubs({
  count = 350,
  groundSize = 6,
  groundY = 0.5,
  scaleMin = 0.25,
  scaleMax = 1.65,
}) {
  count = 2000;
  const { scene: gltfScene } = useGLTF('/models/grass-shurbs.glb');
  const groupRef = useRef();

  useEffect(() => {
    const group = groupRef.current;
    if (!group || !gltfScene) return;

    const dummy = new Object3D();
    const created = [];

    gltfScene.traverse((obj) => {
      if (!obj.isMesh) return;

      const instanced = new InstancedMesh(obj.geometry, obj.material, count);
      instanced.castShadow = false;
      instanced.receiveShadow = true;
      instanced.frustumCulled = false;

      for (let i = 0; i < count; i++) {
        const x = (Math.random() - 0.5) * groundSize;
        const z = (Math.random() - 0.5) * groundSize;

        // Cluster in denser areas matching the grass layout
        const density = cpuVnoise(x * 1.0 + 50, z * 1.0 + 50);
        const detail = cpuVnoise(x * 2.8 + 12, z * 2.8 + 12);
        const noiseVal = density * 0.6 + detail * 0.4;
        const scale = MathUtils.lerp(scaleMin, scaleMax, noiseVal);

        dummy.position.set(x, 0.01 + groundY, z);
        dummy.rotation.y = Math.random() * Math.PI * 2;
        dummy.scale.setScalar(scale);
        dummy.updateMatrix();
        instanced.setMatrixAt(i, dummy.matrix);
      }

      instanced.instanceMatrix.needsUpdate = true;
      group.add(instanced);
      created.push(instanced);
    });

    return () => {
      created.forEach((m) => group.remove(m));
    };
  }, [gltfScene, count, groundSize, groundY, scaleMin, scaleMax]);

  return <group ref={groupRef} />;
}

useGLTF.preload('/models/grass-shurbs.glb');
