import { useIsMobile } from "@/hooks/useIsMobile";
import {
  checkpointOverridesAtom,
  checkpointsAtom,
  OverrideState,
  sliderValueAtom,
} from "@/store/checkPointStore";
import { AnimatePresence, motion } from "framer-motion";
import { useAtom, useAtomValue } from "jotai";
import { SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";
import { InfoPopover } from "../InfoPopover";
import { ExperienceSlider } from "./ExperienceSlider";

const BLUE = "var(--accent)";
const BLUE_DIM = "color-mix(in srgb, var(--accent) 15%, transparent)";
const BLUE_MID = "color-mix(in srgb, var(--accent) 35%, transparent)";
const BLUE_GLOW = "color-mix(in srgb, var(--accent) 18%, transparent)";

function cycleOverride(current: OverrideState): OverrideState {
  if (current === "auto") return "off";
  if (current === "off") return "on";
  if (current === "on") return "auto";
  return "off";
}

export const InfoWidgetContent = () => {
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

  const featureLabel =
    value < 25
      ? "Zen"
      : value < 50
        ? "Focused"
        : value < 75
          ? "Enriched"
          : "Full";

  return (
    <div>
      {/* Slider header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-mono tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
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
          <p
            className="text-[10px] font-mono tracking-[0.2em] uppercase"
            style={{ color: "rgba(255,255,255,0.28)" }}
          >
            Tune the experience
          </p>
        </div>
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: `1px solid color-mix(in srgb, var(--accent) 22%, transparent)`,
            color: BLUE,
          }}
        >
          {featureLabel} · {value}%
        </span>
      </div>

      <ExperienceSlider />

      {checkpoints.length > 0 && (
        <div
          className="mt-5 pt-4 space-y-1.5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          <p
            className="text-[9px] font-mono tracking-[0.22em] uppercase mb-2.5"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            Checkpoint overrides
          </p>
          {checkpoints.map((cp) => {
            const override = overrides[cp.tag] ?? "auto";
            return (
              <div
                key={`override-${cp.tag}`}
                className="flex items-center justify-between gap-3 py-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
                    style={{
                      background: override !== "auto" ? "var(--green)" : BLUE,
                      boxShadow:
                        override !== "auto"
                          ? "0 0 5px color-mix(in srgb, var(--green) 60%, transparent)"
                          : `0 0 5px ${BLUE_GLOW}`,
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
  );
};

export const InfoWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsMobile();

  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((v) => !v);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="info-widget-backdrop"
              className="fixed inset-0 z-[80]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "rgba(4,4,8,0.8)",
                backdropFilter: "blur(12px)",
              }}
              onClick={close}
            />
          )}
        </AnimatePresence>
      )}

      <div className="flex flex-col items-end gap-2">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="info-widget-panel"
              className={
                isMobile
                  ? "fixed inset-x-0 bottom-0 z-[90] p-3"
                  : "relative select-none"
              }
              initial={{
                opacity: 0,
                scale: isMobile ? 1 : 0.92,
                y: isMobile ? 20 : 10,
              }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{
                opacity: 0,
                scale: isMobile ? 1 : 0.92,
                y: isMobile ? 20 : 10,
              }}
              transition={{ duration: 0.26, ease: [0.16, 1, 0.3, 1] }}
              style={
                !isMobile
                  ? {
                      transformOrigin: "bottom right",
                      width: 520,
                      maxWidth: "90vw",
                    }
                  : undefined
              }
            >
              <div
                className="relative p-[1px] rounded-2xl"
                style={{
                  background: `linear-gradient(135deg, ${BLUE_MID} 0%, rgba(255,255,255,0.06) 50%, transparent 100%)`,
                  boxShadow: `0 24px 64px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.04) inset, 0 0 48px ${BLUE_GLOW}`,
                }}
              >
                <div
                  className="rounded-[15px] overflow-hidden"
                  style={{
                    background: "rgba(6,6,10,0.97)",
                    backdropFilter: "blur(32px) saturate(1.8)",
                  }}
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center justify-between px-5 pt-4 pb-3"
                    style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{
                          background: BLUE,
                          boxShadow: `0 0 8px ${BLUE}, 0 0 16px ${BLUE_GLOW}`,
                          animation: "pulse 2.4s ease-in-out infinite",
                        }}
                      />
                      <span
                        className="text-[9px] font-mono tracking-[0.28em] uppercase"
                        style={{
                          color:
                            "color-mix(in srgb, var(--accent) 55%, transparent)",
                        }}
                      >
                        Experience settings
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={close}
                      className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-150"
                      style={{
                        background: "rgba(255,255,255,0.04)",
                        border: "1px solid rgba(255,255,255,0.07)",
                        color: "var(--muted)",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.08)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--text)";
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLElement).style.background =
                          "rgba(255,255,255,0.04)";
                        (e.currentTarget as HTMLElement).style.color =
                          "var(--muted)";
                      }}
                    >
                      <X size={10} strokeWidth={2} />
                    </button>
                  </div>

                  {/* Content */}
                  <div className="px-5 py-5">
                    <InfoWidgetContent />
                  </div>
                </div>
              </div>

              {/* Caret (desktop only) */}
              {!isMobile && (
                <div
                  className="absolute -bottom-[5px] right-[19px]"
                  style={{
                    width: 10,
                    height: 10,
                    background: "rgba(6,6,10,0.97)",
                    border: `1px solid ${BLUE_DIM}`,
                    borderTop: "none",
                    borderLeft: "none",
                    transform: "rotate(45deg)",
                  }}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating button */}
        <motion.button
          type="button"
          onClick={toggle}
          whileHover={{ scale: 1.07 }}
          whileTap={{ scale: 0.9 }}
          transition={{ duration: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl"
          style={{
            background: isOpen ? BLUE_GLOW : "var(--glass)",
            backdropFilter: "blur(14px)",
            border: `1px solid ${isOpen ? BLUE_MID : BLUE_DIM}`,
            boxShadow: isOpen
              ? `0 0 28px ${BLUE_GLOW}, 0 4px 20px var(--bg-a50), 0 1px 0 var(--overlay-sm) inset`
              : `0 4px 20px var(--bg-a45), 0 1px 0 var(--overlay-sm) inset`,
            color: BLUE,
          }}
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0.3, scale: 1 }}
            animate={{ opacity: 0, scale: 1.65 }}
            transition={{ duration: 2.8, repeat: Infinity, ease: "easeOut" }}
            style={{
              border: `1px solid ${BLUE_DIM}`,
              background: "color-mix(in srgb, var(--accent) 4%, transparent)",
            }}
          />
        </motion.button>
      </div>
    </>
  );
};
