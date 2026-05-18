import { useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { useAtom, useAtomValue } from "jotai";
import { Layers, Video, VideoOff } from "lucide-react";
import { useCamera } from "./hooks/useCamera";
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
        "flex items-center gap-[6px]",
        "py-[6px] pr-[12px] pl-[10px]",
        "cursor-pointer rounded-lg font-mono",
        "backdrop-blur transition-all duration-200",
        "z-picker-trigger pointer-events-auto",
        "max-w-[50vw] overflow-hidden whitespace-nowrap",
        "text-label",
        pickerOpen
          ? "bg-white/[0.05] text-ink/80 border border-white/[0.10]"
          : "bg-transparent text-ink-ghost border border-white/[0.06] hover:border-white/[0.10] hover:text-ink-muted",
      ].join(" ")}
    >
      <Layers size={12} className="shrink-0 opacity-70" />
      <span className="overflow-hidden text-ellipsis">
        {selected?.name ?? "select project"}
      </span>
    </button>
  );
}

function CameraToggle({ isActive, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={[
        "fixed top-4 right-4",
        "flex items-center gap-2 p-2! py-[7px]",
        "cursor-pointer rounded-lg font-mono",
        "text-label backdrop-blur transition-all duration-200",
        "pointer-events-auto z-20",
        isActive
          ? "bg-white/[0.05] text-secondary/80 border border-secondary/20"
          : "bg-transparent text-ink-ghost border border-white/[0.06] hover:border-white/[0.10] hover:text-ink-muted",
      ].join(" ")}
    >
      {isActive ? (
        <Video size={12} className="shrink-0" />
      ) : (
        <VideoOff size={12} className="shrink-0 opacity-60" />
      )}
      <span>{isActive ? "Shadow on" : "Shadow off"}</span>
    </button>
  );
}

export const App = () => {
  const captureRef = useRef(null);
  const { videoRef, isActive, toggle } = useCamera();

  return (
    <>
      <Canvas
        gl={{ preserveDrawingBuffer: true }}
        shadows
        camera={{ position: [2, 0.2, 5], fov: 65 }}
        style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh" }}
      >
        <Scene captureRef={captureRef} videoRef={videoRef} isActive={isActive} />
      </Canvas>

      <CameraToggle isActive={isActive} onToggle={toggle} />
      <LiveTextTile />
      <OracleWidget />
      <OracleSidebar />
      <ProjectPickerTrigger />
      <ProjectPicker />
    </>
  );
};
