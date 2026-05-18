import { useAtomValue } from "jotai";
import { motion, AnimatePresence } from "framer-motion";
import Draggable from "react-draggable";
import { TypeAnimation } from "react-type-animation";
import { useRef } from "react";
import { historyAtom } from "../store/cave";

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
};

export function LiveTextTile() {
  const history = useAtomValue(historyAtom);
  const latest = history[history.length - 1] ?? null;
  const nodeRef = useRef(null);

  return (
    <Draggable nodeRef={nodeRef} defaultPosition={{ x: 24, y: 0 }}>
      <div
        ref={nodeRef}
        className="z-tile fixed top-[38%] left-0 w-[clamp(200px,21vw,320px)] cursor-grab select-none active:cursor-grabbing"
      >
        <AnimatePresence>
          {latest && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="overflow-hidden rounded-2xl border border-white/[0.06] bg-overlay-high/90 backdrop-blur-xl shadow-[0_12px_36px_rgba(0,0,0,0.50)]">
                {/* Header row */}
                <div className="flex items-center justify-between px-4 pt-4 pb-3">
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
                <div className="mx-4 h-px bg-white/[0.04]" />

                {/* Text body — ghost anchors height, typewriter overlays */}
                <div className="relative px-4 pt-3 pb-4">
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
    </Draggable>
  );
}
