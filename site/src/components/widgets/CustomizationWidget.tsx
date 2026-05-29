import {
  checkpointOverridesAtom,
  checkpointsAtom,
  OverrideState,
  sliderValueAtom,
} from "@/lib/performanceStore";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { Sparkles } from "lucide-react";
import { useCallback, useState } from "react";
import { InfoPopover } from "../InfoPopover";
import { ExperienceSlider } from "./ExperienceSlider";

const AMBER = "var(--amber)";
const AMBER_DIM = "color-mix(in srgb, var(--amber) 18%, transparent)";
const AMBER_MID = "color-mix(in srgb, var(--amber) 40%, transparent)";
const AMBER_GLOW = "var(--amber-glow)";

export const CustomizationWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const value = useAtomValue(sliderValueAtom);
  const checkpoints = useAtomValue(checkpointsAtom);
  const [overrides, setOverrides] = useAtom(checkpointOverridesAtom);

  const toggleOverride = useCallback(
    (tag: string) => {
      setOverrides((prev) => {
        const next = cycleOverride(prev[tag]);
        if (next === "auto") {
          const { [tag]: _, ...rest } = prev;
          return rest;
        }
        return { ...prev, [tag]: next };
      });
    },
    [setOverrides],
  );

  return (
    <div className="flex flex-col items-end gap-2">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="perf-panel"
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative max-w-[90vw] w-[450px] select-none"
            style={{ transformOrigin: "bottom right" }}
          >
            <div
              className="rounded-2xl px-5 pt-4 pb-4"
              style={{
                background: "var(--glass)",
                backdropFilter: "blur(20px) saturate(1.5)",
                border: `1px solid ${AMBER_DIM}`,
                boxShadow: `0 8px 40px var(--bg-a65), 0 0 0 1px ${AMBER_GLOW} inset, 0 0 32px ${AMBER_GLOW}`,
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{
                      background: AMBER,
                      boxShadow: `0 0 6px ${AMBER}`,
                      animation: "pulse 2s infinite",
                    }}
                  />
                  <span className="text-[10px] font-mono tracking-[0.22em] uppercase text-white/35">
                    <InfoPopover
                      title="Temperature"
                      items={[
                        [
                          "About LLM temperature",
                          "https://www.promptingguide.ai/introduction/settings#:~:text=Temperature",
                        ],
                        [
                          "Common misunderstandings about temperature",
                          "https://dev.to/hermup299/llm-predictability-vs-determinism-2idb",
                        ],
                      ]}
                    />
                  </span>
                </div>
                <span
                  className="text-[11px] font-mono font-bold tabular-nums"
                  style={{ color: AMBER }}
                >
                  {String(value).padStart(3, " ")}%
                </span>
              </div>

              {/* Section title */}
              <p
                className="text-[10px] font-mono tracking-[0.18em] uppercase mb-3"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Customize experience
              </p>

              <ExperienceSlider />

              {checkpoints.length > 0 && (
                <div
                  className="mt-4 pt-3 space-y-1"
                  style={{ borderTop: "1px solid var(--overlay-sm)" }}
                >
                  {checkpoints.map((cp) => {
                    const override = overrides[cp.tag] ?? "auto";
                    return (
                      <div
                        key={`override-checkpoint-tag-${cp.tag}`}
                        className="flex items-center justify-between gap-3 py-1"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
                            style={{
                              background:
                                override !== "auto" ? "var(--green)" : AMBER,
                              boxShadow:
                                override !== "auto"
                                  ? "0 0 5px color-mix(in srgb, var(--green) 60%, transparent)"
                                  : `0 0 5px color-mix(in srgb, var(--amber) 50%, transparent)`,
                            }}
                          />
                          <span
                            className="text-[11px] font-mono uppercase tracking-wider truncate transition-colors duration-200"
                            style={{
                              color:
                                override !== "auto"
                                  ? "var(--border-a70)"
                                  : "var(--border-a35)",
                            }}
                          >
                            {cp.tag}
                          </span>
                          <span
                            className="text-[9px] font-mono tabular-nums shrink-0"
                            style={{ color: "var(--overlay-lg)" }}
                          >
                            @{cp.percentage}%
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => toggleOverride(cp.tag)}
                          className="flex items-center gap-1.5 px-2 py-0.5 rounded-md shrink-0 transition-all duration-150"
                          style={{
                            background:
                              override === "on"
                                ? "color-mix(in srgb, var(--green) 12%, transparent)"
                                : override === "off"
                                  ? "color-mix(in srgb, var(--red) 10%, transparent)"
                                  : "var(--overlay-xs)",
                            border:
                              override === "on"
                                ? "1px solid color-mix(in srgb, var(--green) 30%, transparent)"
                                : override === "off"
                                  ? "1px solid color-mix(in srgb, var(--red) 25%, transparent)"
                                  : "1px solid var(--border)",
                            color:
                              override === "on"
                                ? "var(--green)"
                                : override === "off"
                                  ? "var(--red)"
                                  : "var(--overlay-lg)",
                          }}
                        >
                          <span
                            className="w-1 h-1 rounded-full shrink-0"
                            style={{
                              background:
                                override === "on"
                                  ? "var(--green)"
                                  : override === "off"
                                    ? "var(--red)"
                                    : "var(--overlay-lg)",
                            }}
                          />
                          <span className="text-[9px] font-mono uppercase tracking-wider">
                            {override ?? "auto"}
                          </span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Caret */}
            <div
              className="absolute -bottom-[5px] right-[19px]"
              style={{
                width: 10,
                height: 10,
                background: "var(--glass)",
                border: `1px solid ${AMBER_DIM}`,
                borderTop: "none",
                borderLeft: "none",
                transform: "rotate(45deg)",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        id="performance-widget-btn"
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        whileHover={{ scale: 1.07 }}
        whileTap={{ scale: 0.9 }}
        transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
        className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
        style={{
          background: isOpen ? AMBER_GLOW : "var(--glass)",
          backdropFilter: "blur(14px)",
          border: `1px solid ${isOpen ? AMBER_MID : AMBER_DIM}`,
          boxShadow: isOpen
            ? `0 0 28px color-mix(in srgb, var(--amber) 20%, transparent), 0 4px 20px var(--bg-a50), 0 1px 0 var(--overlay-sm) inset`
            : `0 4px 20px var(--bg-a45), 0 1px 0 var(--overlay-sm) inset`,
          color: AMBER,
        }}
      >
        <Sparkles size={18} strokeWidth={1.5} />
        <motion.span
          className="absolute inset-0 rounded-full pointer-events-none"
          initial={{ opacity: 0.35, scale: 1 }}
          animate={{ opacity: 0, scale: 1.6 }}
          transition={{ duration: 2.6, repeat: Infinity, ease: "easeOut" }}
          style={{
            border: `1px solid ${AMBER_DIM}`,
            background: "color-mix(in srgb, var(--amber) 5%, transparent)",
          }}
        />
      </motion.button>
    </div>
  );
};

function cycleOverride(current: OverrideState): OverrideState {
  if (current === "auto") return "off";
  if (current === "off") return "on";
  if (current === "on") return "auto";
  return "off";
}
