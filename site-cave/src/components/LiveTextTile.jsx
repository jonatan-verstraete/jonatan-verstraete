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
        className="z-tile fixed top-[38%] left-0 w-[clamp(200px,22vw,340px)] cursor-grab select-none"
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
              <div className="oracle-gradient-border rounded-xl p-[1.5px]">
                <div className="bg-overlay-high overflow-hidden rounded-[12.5px] backdrop-blur-lg">
                  {/* header */}
                  <div className="from-primary/6 flex items-center justify-between bg-gradient-to-b to-transparent px-[14px] pt-[10px] pb-[9px]">
                    <div className="flex items-center gap-[7px]">
                      <span className="oracle-live-dot bg-secondary inline-block h-[5px] w-[5px] shrink-0 rounded-full" />
                      <span className="text-micro tracking-ultra text-ink-ghost font-mono uppercase">
                        Oracle
                      </span>
                    </div>
                    <span className="text-micro text-ink-ghost tracking-loose font-mono">
                      {formatTime(latest.timestamp)}
                    </span>
                  </div>

                  {/* separator */}
                  <div className="h-px shrink-0 bg-[linear-gradient(to_right,transparent,rgba(170,59,255,0.25)_30%,rgba(255,159,40,0.2)_70%,transparent)]" />

                  {/* text body — ghost sets height, typewriter overlays */}
                  <div className="relative p-[13px_16px_16px]">
                    {/* ghost: full text, invisible — anchors the height */}
                    <div
                      aria-hidden
                      className="text-read tracking-fine pointer-events-none invisible font-sans leading-[1.7] break-words whitespace-pre-wrap"
                    >
                      {latest.description}
                    </div>

                    {/* typewriter — absolute on top of ghost */}
                    <motion.div
                      key={latest.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-read text-ink tracking-fine absolute top-[13px] right-[16px] left-[16px] font-sans leading-[1.7]"
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
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Draggable>
  );
}
