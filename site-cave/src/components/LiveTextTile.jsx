import { useAtomValue } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import { TypeAnimation } from "react-type-animation";
import { useRef, useCallback } from "react";
import { historyAtom } from "../store/cave";
import { useFloatResize, RESIZE_HANDLES } from "../hooks/useFloatResize";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

const DEFAULT_POS = () => ({
  x: 24,
  y: Math.round(window.innerHeight * 0.35),
  width: 220,
  height: 160,
});

export function LiveTextTile() {
  const history = useAtomValue(historyAtom);
  const latest = history[history.length - 1] ?? null;

  const { size, setSize, startResize } = useFloatResize(
    "tile",
    DEFAULT_POS(),
    { minW: 160, maxW: 480, minH: 80, maxH: 600 },
  );

  const sizeRef = useRef(size);
  sizeRef.current = size;

  const onDragMouseDown = useCallback(
    (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const snap = { ...sizeRef.current };
      const mx = e.clientX, my = e.clientY;

      function onMove(me) {
        const next = {
          ...sizeRef.current,
          x: snap.x + (me.clientX - mx),
          y: snap.y + (me.clientY - my),
        };
        setSize(next);
      }

      function onUp() {
        localStorage.setItem("cave-resize-oracle-tile", JSON.stringify(sizeRef.current));
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      }

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [setSize],
  );

  return (
    <div
      className="z-tile fixed select-none"
      style={{ left: size.x, top: size.y, width: size.width, height: size.height }}
    >
      {/* Resize handles — all 4 edges + corners */}
      {RESIZE_HANDLES.map((h) => (
        <div
          key={h.id}
          onMouseDown={(e) => startResize(e, h.edges)}
          style={{ position: "absolute", cursor: h.cursor, zIndex: 20, ...h.pos }}
          className="group"
        >
          <div
            className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
            style={{
              background:
                h.id.length === 1
                  ? "linear-gradient(to " + ({ n: "bottom", s: "top", e: "left", w: "right" }[h.id]) + ", rgba(255,180,50,0.18), transparent)"
                  : "rgba(255,180,50,0.12)",
              borderRadius: 2,
            }}
          />
        </div>
      ))}

      <AnimatePresence>
        {latest && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ width: "100%", height: "100%" }}
          >
            <div
              className="h-full overflow-hidden rounded-2xl border border-white-subtle bg-overlay-high/90 backdrop-blur-xl shadow-overlay flex flex-col"
            >
              {/* Header row — drag zone */}
              <div
                onMouseDown={onDragMouseDown}
                className="flex shrink-0 cursor-grab items-center justify-between px-4 pt-4 pb-3 active:cursor-grabbing"
              >
                <div className="flex items-center gap-2">
                  <span className="oracle-live-dot inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-secondary" />
                  <span className="text-micro tracking-ultra text-ink-ghost font-mono uppercase">
                    Oracle
                  </span>
                </div>
                <span className="text-micro text-ink-ghost/60 tracking-loose font-mono">
                  {formatTime(latest.timestamp)}
                </span>
              </div>

              {/* Hairline separator */}
              <div className="mx-4 shrink-0 h-px bg-white-dim" />

              {/* Text body */}
              <div className="relative flex-1 min-h-0 overflow-y-auto px-4 pt-3 pb-4">
                <div
                  aria-hidden
                  className="text-read tracking-fine pointer-events-none invisible font-sans leading-[1.75] break-words whitespace-pre-wrap"
                >
                  {latest.description}
                </div>

                <motion.div
                  key={latest.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  className="text-read text-ink/80 tracking-fine absolute top-3 right-4 left-4 font-sans leading-[1.75]"
                >
                  <TypeAnimation
                    key={latest.id}
                    sequence={[latest.description]}
                    speed={72}
                    cursor={false}
                    className="break-words whitespace-pre-wrap"
                  />
                </motion.div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
