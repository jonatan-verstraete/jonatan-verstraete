import { useRef, useEffect, useMemo, useImperativeHandle, useCallback } from "react";
import { useSetAtom } from "jotai";
import { historyAtom } from "../store/cave";
import { Preload, OrbitControls, Cloud, Environment } from "@react-three/drei";
import { useControls, folder } from "leva";
import * as THREE from "three";
import { Dust } from "./VFX/Dust";
import { FlameLight } from "./Wall/FlameLight";
import { ProjectedSurface } from "./ProjectedSurface";
import { SCENE_CONFIG as C } from "./config";
import { Wall } from "./Wall/Wall";
import { Ground } from "./Ground/Ground";
import { useFrame } from "@react-three/fiber";

let gl = null;
export const Scene = ({ videoRef, isActive, ref: globalFunctionRef }) => {
  const spotRef = useRef();
  const targetRef = useRef();
  const setHistory = useSetAtom(historyAtom);

  useFrame((frame) => {
    // todo: better way than this?
    if(!gl) {
      gl = frame.gl;
    }
  });

  useImperativeHandle(globalFunctionRef, () => ({
    captureFrame: (quality) =>
      new Promise((resolve) => {
        gl?.domElement.toBlob(
          (blob) => {
            if (!blob) return resolve(null);
            setHistory((prev) => {
              if (!prev.length) return prev;
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                imageBlob: blob,
              };
              return updated;
            });
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          quality,
        );
      }),
  }));

  const {
    lightX,
    lightY,
    lightZ,
    lightIntensity,
    lightAngle,
    lightPenumbra,
    wallX,
    wallY,
    wallZ,
    wallScale,
    wallRotX,
    ambientIntensity,
    dustOpacity,
    fogDensity,
    fogColor,
    sunX,
    sunY,
    sunZ,
    fireIntensity,
    flameIntensity,
    flameAngle,
    flamePenumbra,
  } = useControls({
    Projector: folder({
      lightX: { value: C.lightX, min: -5, max: 5, step: 0.01 },
      lightY: { value: C.lightY, min: -5, max: 5, step: 0.01 },
      lightZ: { value: C.lightZ, min: -5, max: 5, step: 0.01 },
      lightIntensity: { value: C.lightIntensity, min: 0, max: 80, step: 0.5 },
      lightAngle: { value: C.lightAngle, min: 0.05, max: 1.2, step: 0.01 },
      lightPenumbra: { value: C.lightPenumbra, min: 0, max: 1, step: 0.01 },
    }),
    Wall: folder({
      wallX: { value: C.wallX, min: -5, max: 5, step: 0.01 },
      wallY: { value: C.wallY, min: -5, max: 5, step: 0.01 },
      wallZ: { value: C.wallZ, min: -10, max: 2, step: 0.01 },
      wallScale: { value: C.wallScale, min: 0.05, max: 5, step: 0.01 },
      wallRotX: { value: C.wallRotX, min: -Math.PI, max: Math.PI, step: 0.01 },
    }),
    Atmosphere: folder({
      ambientIntensity: {
        value: C.ambientIntensity,
        min: 0,
        max: 30,
        step: 0.01,
      },
      dustOpacity: { value: C.dustOpacity, min: 0, max: 1, step: 0.01 },
      fogColor: { value: C.fogColor },
      fogDensity: { value: C.fogDensity, min: 0, max: 0.5, step: 0.001 },
    }),
    Fire: folder({
      sunX: { value: C.sunX, min: -5, max: 5, step: 0.01 },
      sunY: { value: C.sunY, min: -5, max: 5, step: 0.01 },
      sunZ: { value: C.sunZ, min: -5, max: 5, step: 0.01 },
      fireIntensity: { value: C.fireIntensity, min: 0, max: 40, step: 0.5 },
      flameIntensity: { value: C.flameIntensity, min: 0, max: 60, step: 0.5 },
      flameAngle: { value: C.flameAngle, min: 0.05, max: 1.4, step: 0.01 },
      flamePenumbra: { value: C.flamePenumbra, min: 0, max: 1, step: 0.01 },
    }),
  });

  const projTarget = useMemo(
    () =>
      new THREE.WebGLRenderTarget(2048, 1024, {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
      }),
    [],
  );
  useEffect(() => () => projTarget.dispose(), [projTarget]);

  useEffect(() => {
    const spot = spotRef.current;
    const tgt = targetRef.current;
    if (!spot || !tgt) return;
    spot.target = tgt;
    tgt.updateMatrixWorld();
  }, []);

  const lightPos = [lightX, lightY, lightZ];
  const sunPos = [sunX, sunY, sunZ];

  return (
    <>
      <color attach="background" args={["#080604"]} />
      <Environment files="/stars.hdr" background />
      {/* <Environment files="/forrest.exr" background /> */}

      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />
      <ambientLight intensity={ambientIntensity} color="#6a5a3a" />
      <group ref={targetRef} position={[0, 0, 0]} />

      <spotLight
        ref={spotRef}
        position={lightPos}
        intensity={lightIntensity}
        angle={lightAngle}
        penumbra={lightPenumbra}
        map={projTarget.texture}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.001}
        color="#fff5d6"
      />
      <OrbitControls />

      {/* Warm omnidirectional fill from fire origin */}
      <pointLight
        position={sunPos}
        intensity={fireIntensity}
        color="#ff6a00"
        distance={8}
        decay={2}
        castShadow
        shadow-mapSize={[512, 512]}
      />
      {/* Flame-shaped spotlight — animated fire gobo projects organic light on the wall */}
      <FlameLight
        position={sunPos}
        intensity={flameIntensity}
        angle={flameAngle}
        penumbra={flamePenumbra}
      />

      <Wall {...{ wallX, wallY, wallZ, wallScale, wallRotX }} />

      <Ground />

      <Dust opacity={dustOpacity} />

      <ProjectedSurface
        target={projTarget}
        videoRef={videoRef}
        isActive={isActive}
      />

      <Preload all />
    </>
  );
};
