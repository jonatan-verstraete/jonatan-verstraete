import { useMemo } from "react";
import { createPortal, useFrame } from "@react-three/fiber";
import { useAtomValue } from "jotai";
import * as THREE from "three";
import { selectedProjectAtom } from "../../store/cave";
import { Video } from "./Video";
import { ProjectText } from "./ProjectText";
import { VideoCam } from "./VideoCam";

export function ProjectedSurface({ target, videoRef, isActive }) {
  const project = useAtomValue(selectedProjectAtom);

  const [scene, camera] = useMemo(() => {
    const s = new THREE.Scene();
    s.background = new THREE.Color(0x151515);
    const cam = new THREE.OrthographicCamera(-1, 1, 0.5, -0.5, 0.1, 10);
    cam.position.set(0, 0, 5);
    return [s, cam];
  }, []);

  useFrame(({ gl }) => {
    const prev = gl.autoClear;
    gl.autoClear = true;
    gl.setRenderTarget(target);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
    gl.autoClear = prev;
  });

  return createPortal(
    <>
      <Video />
      <ProjectText title={project.name} description={project.description} />
      <VideoCam videoRef={videoRef} isActive={isActive} />
    </>,
    scene,
  );
}
