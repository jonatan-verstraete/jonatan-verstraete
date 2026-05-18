import { useRef } from "react";
import { useAtom } from "jotai";
import Draggable from "react-draggable";
import { Eye } from "lucide-react";
import { sidebarOpenAtom } from "../store/cave";

export const OracleWidget = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const nodeRef = useRef(null);
  const draggedRef = useRef(false);

  return (
    <Draggable
      nodeRef={nodeRef}
      onStart={() => {
        draggedRef.current = false;
      }}
      onDrag={() => {
        draggedRef.current = true;
      }}
    >
      <div
        ref={nodeRef}
        data-oracle-widget
        className="z-widget fixed bottom-6 left-6 cursor-grab active:cursor-grabbing"
      >
        {/* Spinning gradient border ring */}
        <div className="oracle-gradient-border inline-flex rounded-full p-[1.5px]">
          <button
            onClick={() => {
              if (!draggedRef.current) setOpen((v) => !v);
            }}
            className={[
              "relative h-11 w-11 cursor-pointer rounded-full border-0",
              "flex items-center justify-center outline-none",
              "backdrop-blur-[16px] backdrop-saturate-[160%]",
              "transition-all duration-[350ms]",
              open
                ? "bg-primary-muted text-primary"
                : "bg-overlay-mid text-secondary",
            ].join(" ")}
            style={{
              animation: open
                ? "glowPrimary 2.6s ease-in-out infinite"
                : "glowAmber 2.6s ease-in-out infinite",
            }}
            title={open ? "Close oracle" : "Open oracle"}
          >
            <Eye size={16} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </Draggable>
  );
};
