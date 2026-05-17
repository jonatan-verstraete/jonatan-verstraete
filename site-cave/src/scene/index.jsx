import { forwardRef, useRef, useImperativeHandle, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import Scene from "./Main";

const CaveScene = forwardRef(({ videoRef, isActive }, ref) => {
  const { gl } = useThree();

  useImperativeHandle(ref, () => ({
    captureFrame: (quality) =>
      captureFrame(gl, quality) ?? Promise.resolve(null),
  }));

  return (
    <Canvas
      gl={{ preserveDrawingBuffer: true }}
      shadows
      camera={{ position: [2, 0.2, 5], fov: 65 }}
      style={{
        display: "block",
        width: "100vw",
        height: "100vh",
        position: "fixed",
        inset: 0,
      }}
    >
      <color attach="background" args={["#080604"]} />
      <Scene videoRef={videoRef} isActive={isActive} />
    </Canvas>
  );
});

function captureFrame(gl, quality = 0.8) {
  return new Promise((resolve) => {
    gl.domElement.toBlob(
      (blob) => {
        if (!blob) return resolve(null);
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(blob);
      },
      "image/jpeg",
      quality,
    );
  });
}

export default CaveScene;
