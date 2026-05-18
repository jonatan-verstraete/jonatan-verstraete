import { useRef, useCallback } from "react";
import { Canvas } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { Layers } from "lucide-react";
import { useCamera } from "./hooks/useCamera";
import { useAnalyze } from "./hooks/useAnalyze";
import { Scene } from "./scene";
import { OracleWidget } from "./components/OracleWidget";
import { OracleSidebar } from "./components/OracleSidebar";
import { LiveTextTile } from "./components/LiveTextTile";
import { ProjectPicker } from "./components/ProjectPicker";
import { pickerOpenAtom, selectedProjectAtom } from "./store/cave";

function ProjectPickerTrigger() {
  const [pickerOpen, setPickerOpen] = useAtom(pickerOpenAtom);
  const selected = useAtomValue(selectedProjectAtom);

  return (
    <button
      onClick={() => setPickerOpen((v) => !v)}
      className={[
        "fixed bottom-4 left-1/2 -translate-x-1/2",
        "flex items-center gap-[7px]",
        "py-[7px] pr-[14px] pl-[10px]",
        "rounded-lg text-xs font-mono cursor-pointer",
        "backdrop-blur transition-colors duration-200",
        "z-picker-trigger pointer-events-auto",
        "whitespace-nowrap max-w-[60vw] overflow-hidden",
        pickerOpen
          ? "bg-primary/18 text-ink border border-primary-border shadow-[0_0_0_1px_rgba(170,59,255,0.3)]"
          : "bg-overlay-low text-ink-muted border border-white/10",
      ].join(" ")}
    >
      <Layers size={13} className="shrink-0" />
      <span className="overflow-hidden text-ellipsis">
        {selected?.name ?? "select project"}
      </span>
    </button>
  );
}

export const App = () => {
  const canvasRef = useRef(null);
  const { videoRef, isActive, toggle } = useCamera();

  useAnalyze(canvasRef.current?.captureFrame);

  return (
    <>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        shadows
        camera={{ position: [2, 0.2, 5], fov: 65 }}
        className="!fixed !inset-0"
      >
        <Scene ref={canvasRef} videoRef={videoRef} isActive={isActive} />
      </Canvas>

      <button
        onClick={toggle}
        className={[
          "fixed top-4 right-4 px-4 py-2",
          "rounded-md text-ui font-sans cursor-pointer",
          "text-ink border border-white/15",
          "backdrop-blur transition-colors duration-200",
          "z-20 pointer-events-auto",
          isActive ? "bg-primary" : "bg-overlay-low",
        ].join(" ")}
      >
        {isActive ? "Shadow On" : "Enable Shadow"}
      </button>

      <LiveTextTile />
      <OracleWidget />
      <OracleSidebar />
      <ProjectPickerTrigger />
      <ProjectPicker />
    </>
  );
};
