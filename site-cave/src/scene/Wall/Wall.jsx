import {  useEffect, memo } from "react";
import { useGLTF } from "@react-three/drei";

const MODEL = "/models/wall.glb"

useGLTF.preload(MODEL);

export const Wall = memo(({
  wallX,
  wallY,
  wallZ,
  wallScale,
  wallRotX,
}) => {
  const { scene } = useGLTF(MODEL);

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = false;
        child.receiveShadow = true;
        if (child.material) {
          child.material.depthTest = true;
          child.material.depthWrite = true;
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
