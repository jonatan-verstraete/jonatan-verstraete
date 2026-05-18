import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAtom } from "jotai";
import { pickerOpenAtom } from "../store/cave";
import { ProjectSearch } from "./ProjectSearch";

const GITHUB_USER = import.meta.env.VITE_GITHUB_USER;

export const ProjectPicker = () => {
  const [open, setOpen] = useAtom(pickerOpenAtom);
  const wrapRef = useRef(null);

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
          style={{ transform: "translateX(-50%)" }}
          className="z-picker bg-overlay-high shadow-overlay fixed bottom-[88px] left-1/2 w-[min(440px,88vw)] overflow-hidden rounded-xl font-sans backdrop-blur-[20px]"
        >
          <ProjectSearch
            autoFocus={open}
            onSelect={() => setOpen(false)}
            onClose={() => setOpen(false)}
            listMaxHeight="300px"
          />

          {/* Keyboard hint footer */}
          <div className="border-white-ghost text-label flex gap-[18px] border-t px-4 py-2 font-mono text-white/[0.18]">
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
