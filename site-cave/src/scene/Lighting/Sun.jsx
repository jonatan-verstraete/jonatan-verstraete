import { folder, useControls } from 'leva';
import { SCENE_CONFIG as C } from '@/scene/config.js';

export const Sun = ({ spotRef }) => {
  const { lightX, lightY, lightZ, lightIntensity, lightAngle, lightPenumbra } = useControls({
    Projector: folder({
      lightX: { value: C.lightX, min: -5, max: 5, step: 0.01 },
      lightY: { value: C.lightY, min: -5, max: 5, step: 0.01 },
      lightZ: { value: C.lightZ, min: -5, max: 5, step: 0.01 },
      lightIntensity: { value: C.lightIntensity, min: 10, max: 500, step: 1 },
      lightAngle: { value: C.lightAngle, min: 0.05, max: 1.2, step: 0.01 },
      lightPenumbra: { value: C.lightPenumbra, min: 0, max: 1, step: 0.01 },
    }),
  });

  return (
    <spotLight
      ref={spotRef}
      position={[lightX, lightY, lightZ]}
      intensity={lightIntensity}
      angle={lightAngle}
      penumbra={lightPenumbra}
      castShadow
      shadow-mapSize={[2048, 2048]}
      shadow-bias={-0.001}
      color="#fff5d6"
    />
  );
};
