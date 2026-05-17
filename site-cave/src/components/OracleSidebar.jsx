import { useRef, useEffect, useMemo } from "react";
import { useAtom, useAtomValue } from "jotai";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { historyAtom, sidebarOpenAtom } from "../store/cave";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
};

const HistoryRow = ({ entry }) => {
  const url = useMemo(
    () => (entry.imageBlob ? URL.createObjectURL(entry.imageBlob) : null),
    [entry.imageBlob],
  );

  useEffect(() => {
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [url]);

  return (
    <motion.div
      className="oracle-entry-sep"
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ type: "spring", damping: 28, stiffness: 280 }}
      style={{
        display: "flex",
        gap: 12,
        padding: "14px 20px 14px 28px",
        position: "relative",
      }}
    >
      {/* timeline accent bar */}
      <div style={{
        position: "absolute",
        left: 16,
        top: 18,
        width: 3,
        height: "calc(100% - 28px)",
        borderRadius: 2,
        background: "linear-gradient(to bottom, var(--secondary-border), transparent)",
        flexShrink: 0,
      }} />

      <div style={{
        flexShrink: 0,
        width: 46,
        height: 46,
        borderRadius: 8,
        overflow: "hidden",
        background: "rgba(255,255,255,0.03)",
        boxShadow: "inset 0 0 0 1px rgba(255,255,255,0.06), 0 2px 8px rgba(0,0,0,0.3)",
      }}>
        {url && (
          <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.88 }} />
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: 10,
          fontFamily: "var(--mono)",
          color: "var(--secondary)",
          opacity: 0.6,
          marginBottom: 5,
          letterSpacing: "0.08em",
        }}>
          {formatTime(entry.timestamp)}
        </div>
        <div style={{
          fontSize: 12,
          color: "rgba(232,224,245,0.68)",
          lineHeight: 1.65,
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          letterSpacing: "0.012em",
        }}>
          {entry.description}
        </div>
      </div>
    </motion.div>
  );
};

export const OracleSidebar = () => {
  const [open, setOpen] = useAtom(sidebarOpenAtom);
  const history = useAtomValue(historyAtom);
  const sidebarRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onMousedown = (e) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target) &&
        !e.target.closest("[data-oracle-widget]")
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onMousedown);
    return () => document.removeEventListener("mousedown", onMousedown);
  }, [open, setOpen]);

  const reversed = [...history].reverse();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={sidebarRef}
          initial={{ x: "-100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 340, damping: 40, mass: 0.85 }}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            bottom: 0,
            width: 300,
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            background: "rgba(7,5,14,0.78)",
            backdropFilter: "blur(36px) saturate(170%)",
            /* right edge fades into scene, no hard border */
            boxShadow: "6px 0 48px rgba(0,0,0,0.7), inset -1px 0 0 rgba(255,255,255,0.04)",
            overflow: "hidden",
          }}
        >
          {/* header */}
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "20px 20px 18px 24px",
            flexShrink: 0,
            position: "relative",
          }}>
            {/* header bottom separator — gradient, not hard line */}
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 16,
              right: 16,
              height: 1,
              background: "linear-gradient(to right, var(--secondary-border), rgba(170,59,255,0.15), transparent)",
            }} />

            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span className="oracle-live-dot" style={{
                display: "inline-block",
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "var(--secondary)",
                flexShrink: 0,
              }} />
              <span style={{
                fontSize: 10,
                fontFamily: "var(--mono)",
                letterSpacing: "0.2em",
                textTransform: "uppercase",
                color: "rgba(232,224,245,0.45)",
              }}>
                Oracle Memory
              </span>
            </div>

            <button
              className="oracle-close-btn"
              onClick={() => setOpen(false)}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "1px solid rgba(255,255,255,0.08)",
                background: "rgba(255,255,255,0.03)",
                color: "rgba(232,224,245,0.45)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                transition: "box-shadow 0.2s, background 0.2s, color 0.2s, border-color 0.2s",
                outline: "none",
                flexShrink: 0,
              }}
            >
              <X size={12} strokeWidth={1.6} />
            </button>
          </div>

          {/* count badge */}
          {reversed.length > 0 && (
            <div style={{
              padding: "7px 24px 7px",
              flexShrink: 0,
            }}>
              <span style={{
                fontSize: 10,
                fontFamily: "var(--mono)",
                color: "var(--secondary)",
                opacity: 0.38,
                letterSpacing: "0.06em",
              }}>
                {reversed.length} {reversed.length === 1 ? "entry" : "entries"}
              </span>
            </div>
          )}

          {/* list */}
          <div style={{ flex: 1, overflowY: "auto", paddingBottom: 20 }} className="oracle-scroll">
            {reversed.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                style={{
                  padding: "36px 24px",
                  fontSize: 12,
                  color: "rgba(232,224,245,0.22)",
                  fontStyle: "italic",
                  lineHeight: 1.8,
                  letterSpacing: "0.02em",
                }}
              >
                The cave has not yet spoken.
              </motion.div>
            ) : (
              reversed.map((entry) => (
                <HistoryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {/* bottom accent shimmer */}
          <div style={{
            height: 1,
            background: "linear-gradient(to right, var(--secondary-border), rgba(170,59,255,0.2), transparent)",
            flexShrink: 0,
          }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
};
