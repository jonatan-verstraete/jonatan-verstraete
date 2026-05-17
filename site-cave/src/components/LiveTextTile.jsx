import { useAtomValue } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import Draggable from "react-draggable";
import { TypeAnimation } from "react-type-animation";
import { useRef } from "react";
import { historyAtom } from "../store/cave";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
};

export function LiveTextTile() {
  const history = useAtomValue(historyAtom);
  const latest = history[history.length - 1] ?? null;
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} defaultPosition={{ x: 24, y: 0 }}>
      <div
        ref={nodeRef}
        style={{
          position: "fixed",
          left: 0,
          top: "38%",
          width: "clamp(200px, 22vw, 340px)",
          zIndex: 30,
          cursor: "grab",
          userSelect: "none",
        }}
      >
        <AnimatePresence>
          {latest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
            >
              {/* spinning gradient border wrapper */}
              <div
                className="oracle-gradient-border"
                style={{ borderRadius: 14, padding: 1.5 }}
              >
                <div
                  style={{
                    borderRadius: 12.5,
                    background: "rgba(7,5,14,0.88)",
                    backdropFilter: "blur(14px)",
                    WebkitBackdropFilter: "blur(14px)",
                    overflow: "hidden",
                  }}
                >
                  {/* header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 14px 9px",
                      background:
                        "linear-gradient(to bottom, rgba(170,59,255,0.06), transparent)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <span
                        className="oracle-live-dot"
                        style={{
                          display: "inline-block",
                          width: 5,
                          height: 5,
                          borderRadius: "50%",
                          background: "var(--secondary)",
                          flexShrink: 0,
                        }}
                      />
                      <span
                        style={{
                          fontSize: 9,
                          fontFamily: "var(--mono)",
                          letterSpacing: "0.22em",
                          textTransform: "uppercase",
                          color: "rgba(232,224,245,0.4)",
                        }}
                      >
                        Oracle
                      </span>
                    </div>
                    <span
                      style={{
                        fontSize: 9,
                        fontFamily: "var(--mono)",
                        color: "rgba(232,224,245,0.22)",
                        letterSpacing: "0.06em",
                      }}
                    >
                      {formatTime(latest.timestamp)}
                    </span>
                  </div>

                  {/* separator */}
                  <div
                    style={{
                      height: 1,
                      background:
                        "linear-gradient(to right, transparent, rgba(170,59,255,0.25) 30%, rgba(255,159,40,0.2) 70%, transparent)",
                      flexShrink: 0,
                    }}
                  />

                  {/* text body — ghost sets height, typewriter overlays */}
                  <div style={{ padding: "13px 16px 16px", position: "relative" }}>
                    {/* ghost: full text, invisible — anchors the height */}
                    <div
                      aria-hidden
                      style={{
                        visibility: "hidden",
                        pointerEvents: "none",
                        fontSize: 15,
                        lineHeight: 1.7,
                        fontFamily: "var(--sans)",
                        letterSpacing: "0.014em",
                        whiteSpace: "pre-wrap",
                        wordBreak: "break-word",
                      }}
                    >
                      {latest.description}
                    </div>

                    {/* typewriter — absolute on top of ghost */}
                    <motion.div
                      key={latest.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        position: "absolute",
                        top: 13,
                        left: 16,
                        right: 16,
                        fontSize: 15,
                        lineHeight: 1.7,
                        color: "rgba(232,224,245,0.88)",
                        fontFamily: "var(--sans)",
                        letterSpacing: "0.014em",
                      }}
                    >
                      <TypeAnimation
                        key={latest.id}
                        sequence={[latest.description]}
                        speed={72}
                        cursor={false}
                        style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}
                      />
                    </motion.div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Draggable>
  );
}
