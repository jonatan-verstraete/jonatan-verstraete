import { usePBRTextures } from '@/hooks/useModel.js';

export function SoilFloor({ groundSize = 6, groundY = -0.5, textureRepeat = 3 }) {
  const textures = usePBRTextures(
    {
      map: '/textures/Ground068_Color.webp',
      normalMap: '/textures/Ground068_NormalGL.webp',
      roughnessMap: '/textures/Ground068_Roughness.webp',
      aoMap: '/textures/Ground068_AO.webp',
    },
    textureRepeat,
  );

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, groundY, 0]} receiveShadow>
      <planeGeometry args={[groundSize, groundSize, 32, 32]} />
      <meshStandardMaterial {...textures} roughness={0.95} metalness={0.0} />
    </mesh>
  );
}
