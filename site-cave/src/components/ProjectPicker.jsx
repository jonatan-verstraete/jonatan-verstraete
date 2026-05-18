import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { pickerOpenAtom } from "../store/cave";
import { ProjectSearch } from "./ProjectSearch";
import { useFloatResize, RESIZE_HANDLES } from "../hooks/useFloatResize";

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

export const ProjectPicker = () => {
  const [open, setOpen] = useAtom(pickerOpenAtom);
  const wrapRef = useRef(null);

  const { size, startResize } = useFloatResize(
    "picker",
    { width: 420, height: 380 },
    { minW: 260, maxW: 700, minH: 150, maxH: 600 },
  );

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, setOpen]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={wrapRef}
          initial={{ opacity: 0, y: 10, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 440, damping: 36 }}
          style={{
            width: size.width,
            height: size.height,
            left: `calc(50% - ${size.width / 2}px)`,
          }}
          className="z-picker bg-overlay-mid/95 shadow-overlay fixed bottom-[88px] overflow-hidden rounded-2xl border border-white-dim font-sans backdrop-blur-mid flex flex-col"
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
                      ? "linear-gradient(to " +
                        ({ n: "bottom", s: "top", e: "left", w: "right" }[h.id]) +
                        ", rgba(255,180,50,0.18), transparent)"
                      : "rgba(255,180,50,0.12)",
                  borderRadius: 2,
                }}
              />
            </div>
          ))}

          {/* Scrollable search content */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <ProjectSearch
              autoFocus={open}
              onSelect={() => setOpen(false)}
              onClose={() => setOpen(false)}
              listMaxHeight={`${Math.max(60, size.height - 90)}px`}
            />
          </div>

          {/* Keyboard hint footer */}
          <div className="flex shrink-0 gap-[18px] border-t border-white-dim px-4 py-2.5 font-mono text-micro text-ink-ghost/80">
            <span>↑↓ navigate</span>
            <span>↵ select</span>
            <span>esc close</span>
            {GITHUB_USER && (
              <span className="ml-auto">@{GITHUB_USER}</span>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
