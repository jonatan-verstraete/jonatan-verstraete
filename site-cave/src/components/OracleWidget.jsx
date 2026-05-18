import { useRef } from "react";
import { useAtom } from "jotai";
import Draggable from "react-draggable";
import { Eye } from "lucide-react";
import { sidebarOpenAtom } from "../store/cave";

export const OracleWidget = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const nodeRef = useRef(null);
  const draggedRef = useRef(false);

  return null

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={() => { draggedRef.current = false; }}
      onDrag={() => { draggedRef.current = true; }}
    >
      <div
        ref={nodeRef}
        data-oracle-widget
        className="fixed bottom-7 left-7 z-widget cursor-grab"
      >
        {/* spinning gradient border */}
        <div className="oracle-gradient-border rounded-full p-[1.5px] inline-flex">
          <button
            onClick={() => { if (!draggedRef.current) setOpen((v) => !v); }}
            className={[
              "relative w-12 h-12 rounded-full border-0 cursor-pointer",
              "flex items-center justify-center outline-none",
              "backdrop-blur-[16px] backdrop-saturate-[160%]",
              "transition-all duration-[350ms]",
              "hover:shadow-ring hover:border-primary-border hover:brightness-110",
              open ? "bg-primary-muted text-primary" : "bg-overlay-mid text-secondary",
            ].join(" ")}
            style={{
              animation: open
                ? "glowPrimary 2.6s ease-in-out infinite"
                : "glowAmber 2.6s ease-in-out infinite",
            }}
          >
            <Eye size={17} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </Draggable>
  );
};
