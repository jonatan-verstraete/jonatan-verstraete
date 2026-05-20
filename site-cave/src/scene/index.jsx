import { useRef, useEffect, useCallback, useImperativeHandle } from "react";
import { useSetAtom } from "jotai";
import { historyAtom } from "../store/cave";
import { Preload, OrbitControls, Environment } from "@react-three/drei";
import { useControls, folder } from "leva";
import { useFrame } from "@react-three/fiber";
import { devLog } from "../utils";
import { Lighting } from "./Lighting";
import { ProjectedSurface } from "./ProjectedSurface";
import { Wall } from "./Wall/Wall";
import { DepthEchoOverlay } from "./Wall/DepthEchoOverlay";
import { Ground } from "./Ground/Ground";
import { SCENE_CONFIG as C } from "./config";

export const Scene = ({ videoRef, isActive, captureRef }) => {
  const spotRef = useRef();
  const getCanvasBlobRef = useRef();
  const surfaceRef = useRef(null);
  const setHistory = useSetAtom(historyAtom);

  const { fogDensity, fogColor } = useControls({
    Atmosphere: folder({
      fogColor: { value: C.fogColor },
      fogDensity: { value: C.fogDensity, min: 0, max: 0.5, step: 0.001 },
    }),
  });

  useImperativeHandle(captureRef, () => ({
    captureFrame: (quality) =>
      new Promise((resolve) => {
        getCanvasBlobRef.current?.(
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
            reader.onerror = () => {
              devLog("Failed to read canvas blob");
              resolve(null);
            };
            reader.readAsDataURL(blob);
          },
          "image/jpeg",
          quality,
        );
      }),
  }));

  return (
    <>
      <color attach="background" args={["#080604"]} />
      <Environment files="/stars.hdr" background />

      <fogExp2 attach="fog" args={[fogColor, fogDensity]} />

      <OrbitControls />

      <Lighting spotRef={spotRef} surfaceRef={surfaceRef} />

      <Wall />
      <DepthEchoOverlay spotRef={spotRef} surfaceRef={surfaceRef} />
      <Ground />

      {/* <Dust opacity={dustOpacity} /> */}
      <ProjectedSurface
        videoRef={videoRef}
        isActive={isActive}
        surfaceRef={surfaceRef}
      />

      <Preload all />
    </>
  );
};
