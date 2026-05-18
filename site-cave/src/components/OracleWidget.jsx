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
        style={{ position: "fixed", bottom: 28, left: 28, zIndex: 50, cursor: "grab" }}
      >
        {/* spinning gradient border */}
        <div
          className="oracle-gradient-border"
          style={{ borderRadius: "50%", padding: 1.5, display: "inline-flex" }}
        >
          <button
            onClick={() => { if (!draggedRef.current) setOpen((v) => !v); }}
            className="oracle-widget-btn"
            style={{
              width: 48,
              height: 48,
              borderRadius: "50%",
              border: "none",
              background: open ? "var(--primary-muted)" : "rgba(7,5,14,0.75)",
              color: open ? "var(--primary)" : "var(--secondary)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(16px) saturate(160%)",
              transition: "background 0.35s, color 0.35s, box-shadow 0.35s",
              animation: open
                ? "glowPrimary 2.6s ease-in-out infinite"
                : "glowAmber 2.6s ease-in-out infinite",
              outline: "none",
              WebkitTapHighlightColor: "transparent",
            }}
          >
            <Eye size={17} strokeWidth={1.4} />
          </button>
        </div>
      </div>
    </Draggable>
  );
};
