import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider } from "jotai";
import { useCamera } from "./hooks/useCamera";
import { useAnalyze } from "./hooks/useAnalyze";
import { Scene } from "./scene";
import { OracleWidget } from "./components/OracleWidget";
import { OracleSidebar } from "./components/OracleSidebar";
import { LiveTextTile } from "./components/LiveTextTile";

const queryClient = new QueryClient();

// Isolated so useAnalyze re-renders never propagate up to Cave or CaveScene.
function AnalysisRunner({ captureFrame }) {
  useAnalyze(captureFrame);
  return null;
}

export const App = () => {
  const canvasRef = useRef(null);
  const { videoRef, isActive, toggle } = useCamera();

  const captureFrame = useCallback(() => {
    return canvasRef.current?.captureFrame() ?? null;
  }, []);

  return (
    <JotaiProvider>
      <QueryClientProvider client={queryClient}>
        <Canvas
          gl={{ preserveDrawingBuffer: true }}
          shadows
          camera={{ position: [2, 0.2, 5], fov: 65 }}
          style={{ position: "fixed", inset: 0 }}
        >
          <Scene ref={canvasRef} videoRef={videoRef} isActive={isActive} />
        </Canvas>
        <button
          onClick={toggle}
          style={{
            position: "fixed",
            top: 16,
            right: 16,
            padding: "8px 16px",
            background: isActive ? "#aa3bff" : "rgba(8,6,13,0.6)",
            color: "#e8e0f5",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 6,
            fontSize: 13,
            fontFamily: "system-ui, sans-serif",
            cursor: "pointer",
            backdropFilter: "blur(6px)",
            transition: "background 0.2s",
            zIndex: 20,
            pointerEvents: "auto",
          }}
        >
          {isActive ? "Shadow On" : "Enable Shadow"}
        </button>

        {/* full-canvas vignette: transparent → black, anchors the sidebar */}
        <div
          aria-hidden
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10,
            pointerEvents: "none",
            background:
              "linear-gradient(to right, rgba(6,4,11,0.92) 0%, rgba(6,4,11,0.55) 22%, rgba(6,4,11,0.1) 48%, transparent 68%)",
          }}
        />

        <AnalysisRunner captureFrame={captureFrame} />
        <LiveTextTile />
        <OracleWidget />
        <OracleSidebar />
      </QueryClientProvider>
    </JotaiProvider>
  );
};
