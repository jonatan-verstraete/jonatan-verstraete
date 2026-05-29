import { ExperienceSlider } from "@/components/widgets/ExperienceSlider";
import { useIsMobile } from "@/hooks/useIsMobile";
import { sliderValueAtom } from "@/lib/performanceStore";
import { AnimatePresence, motion } from "framer-motion";
import { useAtomValue } from "jotai";
import { useEffect, useState } from "react";
import Xarrow from "react-xarrows";

const ACCENT = "var(--accent)";
const ACCENT_DIM = "var(--accent-dim)";

export const GreetingPopover = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(true);
  const [arrowReady, setArrowReady] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(() => setArrowReady(true), 450);
      return () => clearTimeout(t);
    }
    setArrowReady(false);
  }, [isOpen]);

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="greeting-backdrop"
            className="fixed inset-0 z-[90]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "rgba(4,4,8,0.75)",
              backdropFilter: "blur(16px)",
            }}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="greeting-modal"
            className={
              isMobile
                ? "fixed inset-0 z-[100]"
                : "fixed inset-4 z-[100]"
            }
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <ModalCard isMobile={isMobile} onClose={() => setIsOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      {arrowReady && !isMobile && (
        <Xarrow
          start="greeting-perf-hint"
          end="performance-widget-btn"
          color="rgba(79,124,255,0.55)"
          strokeWidth={1.5}
          headSize={5}
          path="smooth"
          dashness={{ strokeLen: 5, nonStrokeLen: 4, animation: 0.8 }}
          startAnchor="right"
          endAnchor="top"
          curveness={0.6}
          zIndex={95}
        />
      )}
    </>
  );
};

const ModalCard = ({
  isMobile,
  onClose,
}: {
  isMobile: boolean;
  onClose: () => void;
}) => {
  const value = useAtomValue(sliderValueAtom);

  const featureLabel =
    value < 25
      ? "Zen"
      : value < 50
        ? "Focused"
        : value < 75
          ? "Enriched"
          : "Full";

  return (
    <div
      className="relative p-[1.5px] rounded-2xl h-full"
      style={{
        background: ACCENT_DIM,
        boxShadow:
          "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05) inset, 0 0 40px rgba(79,124,255,0.06)",
      }}
    >
      <div className="ip-snake" aria-hidden />

      <div
        className="relative z-10 rounded-[14.5px] overflow-hidden h-full flex flex-col"
        style={{
          background: "rgba(6,6,10,0.97)",
          backdropFilter: "blur(32px) saturate(1.8)",
        }}
      >
        {/* Mobile warning */}
        <AnimatePresence>
          {isMobile && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="overflow-hidden"
            >
              <div
                className="flex items-start gap-3 px-5 py-3"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(245,158,11,0.05) 100%)",
                  borderBottom: "1px solid rgba(245,158,11,0.15)",
                }}
              >
                <span
                  className="text-base shrink-0 mt-px"
                  style={{
                    filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))",
                  }}
                >
                  ⚠
                </span>
                <div>
                  <p
                    className="text-[11px] font-semibold tracking-wide uppercase mb-0.5"
                    style={{ color: "var(--amber)" }}
                  >
                    Mobile detected
                  </p>
                  <p
                    className="text-[11px] leading-relaxed"
                    style={{ color: "rgba(245,158,11,0.7)" }}
                  >
                    Some experiences are limited on mobile. For the full effect,{" "}
                    <span style={{ color: "var(--amber)" }}>
                      a desktop is highly recommended.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main content */}
        <div className="px-7 pt-6 pb-7 flex-1 overflow-y-auto">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full"
                  style={{
                    background: ACCENT,
                    boxShadow: `0 0 8px ${ACCENT}, 0 0 16px rgba(79,124,255,0.4)`,
                    animation: "pulse 2.4s ease-in-out infinite",
                  }}
                />
                <span
                  className="text-[9px] font-mono tracking-[0.28em] uppercase"
                  style={{ color: "rgba(79,124,255,0.55)" }}
                >
                  Welcome
                </span>
              </div>

              <h1
                className="text-2xl font-semibold tracking-tight mb-1"
                style={{ color: "var(--text)" }}
              >
                Hey, I'm{" "}
                <span
                  className="relative inline-block"
                  style={{
                    background:
                      "linear-gradient(110deg, var(--text) 0%, var(--accent) 55%, var(--text) 100%)",
                    backgroundSize: "200% 100%",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    animation: "shimmer 3.5s ease-in-out infinite",
                  }}
                >
                  Jonatan.
                </span>
              </h1>
              <p
                className="text-[13px] leading-relaxed"
                style={{ color: "var(--muted)" }}
              >
                Software engineer. This is my corner of the internet.
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 shrink-0 mt-0.5"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.07)",
                color: "var(--muted)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.08)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.background =
                  "rgba(255,255,255,0.04)";
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              }}
            >
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                <path
                  d="M1 1l8 8M9 1l-8 8"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* Divider */}
          <div
            className="mb-5"
            style={{ height: 1, background: "rgba(255,255,255,0.05)" }}
          />

          {/* Slider section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <p
                className="text-[11px] font-mono tracking-[0.18em] uppercase"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                Tune the experience
              </p>
              <span
                className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(79,124,255,0.1)",
                  border: "1px solid rgba(79,124,255,0.2)",
                  color: ACCENT,
                }}
              >
                {featureLabel}
              </span>
            </div>

            <ExperienceSlider />

            {/* Arrow hint element */}
            <div
              id="greeting-perf-hint"
              className="flex items-center gap-2 px-3 py-2 rounded-xl mt-4"
              style={{
                background: "rgba(79,124,255,0.06)",
                border: "1px solid rgba(79,124,255,0.14)",
                width: "fit-content",
              }}
            >
              <span
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: ACCENT,
                  boxShadow: `0 0 8px ${ACCENT}`,
                  display: "inline-block",
                  flexShrink: 0,
                }}
              />
              <span
                className="text-[11px] font-mono"
                style={{ color: "rgba(79,124,255,0.75)" }}
              >
                Fine-grained controls over there →
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          className="px-7 py-3 flex items-center justify-between shrink-0"
          style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
        >
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 text-[11px] font-medium px-3 py-1.5 rounded-lg transition-all duration-150"
            style={{
              background: "rgba(79,124,255,0.12)",
              border: "1px solid rgba(79,124,255,0.2)",
              color: ACCENT,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(79,124,255,0.2)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background =
                "rgba(79,124,255,0.12)";
            }}
          >
            Enter
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path
                d="M2 5h6M5.5 2l3 3-3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
