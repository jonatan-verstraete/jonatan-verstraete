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
        className="fixed left-0 top-[38%] w-[clamp(200px,22vw,340px)] z-tile cursor-grab select-none"
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
                <div className="rounded-[12.5px] bg-overlay-high backdrop-blur-lg overflow-hidden">

                  {/* header */}
                  <div className="flex items-center justify-between pt-[10px] px-[14px] pb-[9px] bg-gradient-to-b from-primary/6 to-transparent">
                    <div className="flex items-center gap-[7px]">
                      <span className="oracle-live-dot inline-block w-[5px] h-[5px] rounded-full bg-secondary shrink-0" />
                      <span className="text-micro font-mono tracking-ultra uppercase text-ink-ghost">
                        Oracle
                      </span>
                    </div>
                    <span className="text-micro font-mono text-ink-ghost tracking-loose">
                      {formatTime(latest.timestamp)}
                    </span>
                  </div>

                  {/* separator */}
                  <div className="h-px shrink-0 bg-[linear-gradient(to_right,transparent,rgba(170,59,255,0.25)_30%,rgba(255,159,40,0.2)_70%,transparent)]" />

                  {/* text body — ghost sets height, typewriter overlays */}
                  <div className="p-[13px_16px_16px] relative">
                    {/* ghost: full text, invisible — anchors the height */}
                    <div
                      aria-hidden
                      className="invisible pointer-events-none text-read leading-[1.7] font-sans tracking-fine whitespace-pre-wrap break-words"
                    >
                      {latest.description}
                    </div>

                    {/* typewriter — absolute on top of ghost */}
                    <motion.div
                      key={latest.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      className="absolute top-[13px] left-[16px] right-[16px] text-read leading-[1.7] text-ink font-sans tracking-fine"
                    >
                      <TypeAnimation
                        key={latest.id}
                        sequence={[latest.description]}
                        speed={72}
                        cursor={false}
                        className="whitespace-pre-wrap break-words"
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
