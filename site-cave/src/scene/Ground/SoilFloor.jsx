import { useMemo } from "react";
import * as THREE from "three";
import { useTexture } from "@react-three/drei";

export function SoilFloor({ groundSize = 6, groundY = -0.5, textureRepeat = 3 }) {
  const textures = useTexture({
    map:          "/textures/Ground068_2K-JPG_Color.jpg",
    normalMap:    "/textures/Ground068_2K-JPG_NormalGL.jpg",
    roughnessMap: "/textures/Ground068_2K-JPG_Roughness.jpg",
    aoMap:        "/textures/Ground068_2K-JPG_AmbientOcclusion.jpg",
  });

  useMemo(() => {
    Object.values(textures).forEach((t) => {
      t.wrapS = t.wrapT = THREE.RepeatWrapping;
      t.repeat.set(textureRepeat, textureRepeat);
    });
  }, [textures, textureRepeat]);

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, groundY, 0]}
      receiveShadow
    >
      <planeGeometry args={[groundSize, groundSize, 32, 32]} />
      <meshStandardMaterial {...textures} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}
