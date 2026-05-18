import { useEffect, memo } from "react";
import { useGLTF } from "@react-three/drei";

const MODEL = "/models/wall.glb";

useGLTF.preload(MODEL);

export const Wall = memo(({ wallX, wallY, wallZ, wallScale, wallRotX }) => {
  const { scene } = useGLTF(MODEL);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthTest = true;
          child.material.depthWrite = true;
          // Reduce normal/roughness so projected text+shadow read cleanly on the craggy wall
          // if (child.material.normalScale) child.material.normalScale.set(0.35, 0.35);
          // if (child.material.roughness != null) child.material.roughness = 0.65;
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
