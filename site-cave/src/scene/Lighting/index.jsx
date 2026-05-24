import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { folder, useControls } from 'leva';
import { SCENE_CONFIG as C } from '@/scene/config.js';
import { Fire } from './Fire';
import { Sun } from './Sun';

export const Lighting = ({ surfaceRef }) => {
  const spotRef = useRef();
  const targetRef = useRef();

  const { ambientIntensity } = useControls({
    Atmosphere: folder({
      ambientIntensity: {
        value: C.ambientIntensity,
        min: 0,
        max: 30,
        step: 0.01,
      },
    }),
  });

  useFrame(({ clock }) => {
    const spot = spotRef.current;
    if (!spot) return;

    const latestAccum = surfaceRef.current;
    if (latestAccum) spot.map = latestAccum.texture;

    // Subtle fire-flicker color temperature on the projector spotlight
    const t = clock.getElapsedTime();
    const flicker = Math.sin(t * 2.7) * 0.4 + Math.sin(t * 4.1) * 0.3 + Math.sin(t * 0.9) * 0.3;
    const n = (flicker + 1) * 0.5;
    spot.color.setRGB(0.97 + n * 0.03, 0.91 + n * 0.04, 0.78 + n * 0.06);
  }); // add: -1

  useEffect(() => {
    const spot = spotRef.current;
    const tgt = targetRef.current;
    if (!spot || !tgt) return;
    spot.target = tgt;
    tgt.updateMatrixWorld();
  }, []);

  return (
    <>
      <ambientLight intensity={ambientIntensity} color="#6a5a3a" />
      <group ref={targetRef} position={[0, 0, 0]} />
      <Fire />
      <Sun spotRef={spotRef} />
    </>
  );
};
