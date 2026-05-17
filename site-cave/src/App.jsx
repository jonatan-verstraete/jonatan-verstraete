import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider as JotaiProvider, useAtom, useAtomValue } from "jotai";
import { Layers } from "lucide-react";
import { useCamera } from "./hooks/useCamera";
import { useAnalyze } from "./hooks/useAnalyze";
import { Scene } from "./scene";
import { OracleWidget } from "./components/OracleWidget";
import { OracleSidebar } from "./components/OracleSidebar";
import { LiveTextTile } from "./components/LiveTextTile";
import { ProjectPicker } from "./components/ProjectPicker";
import { pickerOpenAtom, selectedProjectAtom } from "./store/cave";

const queryClient = new QueryClient();

function AnalysisRunner({ captureFrame }) {
  useAnalyze(captureFrame);
  return null;
}

function ProjectPickerTrigger() {
  const [pickerOpen, setPickerOpen] = useAtom(pickerOpenAtom);
  const selected = useAtomValue(selectedProjectAtom);

  return (
    <button
      onClick={() => setPickerOpen((v) => !v)}
      style={{
        position:       "fixed",
        bottom:         16,
        left:           "50%",
        transform:      "translateX(-50%)",
        padding:        "7px 14px 7px 10px",
        background:     pickerOpen ? "rgba(170,59,255,0.18)" : "rgba(8,6,13,0.6)",
        color:          pickerOpen ? "rgba(220,200,255,0.95)" : "rgba(232,224,245,0.7)",
        border:         pickerOpen
          ? "1px solid rgba(170,59,255,0.45)"
          : "1px solid rgba(255,255,255,0.1)",
        borderRadius:   8,
        fontSize:       12,
        fontFamily:     "ui-monospace, monospace",
        cursor:         "pointer",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        transition:     "background 0.2s, color 0.2s, border-color 0.2s",
        zIndex:         65,
        pointerEvents:  "auto",
        display:        "flex",
        alignItems:     "center",
        gap:            7,
        whiteSpace:     "nowrap",
        maxWidth:       "60vw",
        overflow:       "hidden",
        textOverflow:   "ellipsis",
        boxShadow:      pickerOpen ? "0 0 0 1px rgba(170,59,255,0.3)" : "none",
      }}
    >
      <Layers size={13} style={{ flexShrink: 0 }} />
      <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>
        {selected?.name ?? "select project"}
      </span>
    </button>
  );
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
            position:       "fixed",
            top:            16,
            right:          16,
            padding:        "8px 16px",
            background:     isActive ? "#aa3bff" : "rgba(8,6,13,0.6)",
            color:          "#e8e0f5",
            border:         "1px solid rgba(255,255,255,0.15)",
            borderRadius:   6,
            fontSize:       13,
            fontFamily:     "system-ui, sans-serif",
            cursor:         "pointer",
            backdropFilter: "blur(6px)",
            transition:     "background 0.2s",
            zIndex:         20,
            pointerEvents:  "auto",
          }}
        >
          {isActive ? "Shadow On" : "Enable Shadow"}
        </button>

        {/* full-canvas vignette */}
        <div
          aria-hidden
          style={{
            position:   "fixed",
            inset:      0,
            zIndex:     10,
            pointerEvents: "none",
            background:
              "linear-gradient(to right, rgba(6,4,11,0.92) 0%, rgba(6,4,11,0.55) 22%, rgba(6,4,11,0.1) 48%, transparent 68%)",
          }}
        />

        <AnalysisRunner captureFrame={captureFrame} />
        <LiveTextTile />
        <OracleWidget />
        <OracleSidebar />
        <ProjectPickerTrigger />
        <ProjectPicker />
      </QueryClientProvider>
    </JotaiProvider>
  );
};
