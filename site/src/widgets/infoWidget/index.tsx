import { InfoPopover } from "@/components/InfoPopover";
import { useIsMobile } from "@/hooks/useDevice";
import { useOutsideClick } from "@/hooks/useOutsideClick";
import { useWidgetDisclosure } from "@/hooks/useWidgetDisclosure";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useRef } from "react";
import { InfoWidgetContent } from "./Content";

export const InfoWidget = () => {
  const isMobile = useIsMobile();
  const { isOpen, onToggle, onClose } = useWidgetDisclosure("info");
  const containerRef = useRef<HTMLDivElement>(null);

  useOutsideClick(containerRef, onClose, isOpen && !isMobile);

  return (
    <>
      {/* Mobile backdrop */}
      {isMobile && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="info-widget-backdrop"
              className="fixed inset-0 z-80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              style={{
                background: "var(--bg-a80)",
                backdropFilter: "blur(12px)",
              }}
              onClick={onClose}
            />
          )}
        </AnimatePresence>
      )}

      <div ref={containerRef} className="relative">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              key="info-widget-panel"
              className={
                isMobile
                  ? "fixed inset-x-0 bottom-0 z-90 p-3"
                  : "absolute bottom-[calc(100%+12px)] right-0 select-none"
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
                className="relative p-px rounded-2xl"
                style={{
                  background:
                    "linear-gradient(135deg, color-mix(in srgb, var(--accent) 35%, transparent) 0%, var(--overlay-sm) 50%, transparent 100%)",
                  boxShadow:
                    "0 24px 64px var(--bg-a65), 0 0 0 1px var(--overlay-xs) inset, 0 0 48px color-mix(in srgb, var(--accent) 18%, transparent)",
                }}
              >
                <div
                  className="rounded-[15px] overflow-hidden"
                  style={{
                    background: "var(--glass)",
                    backdropFilter: "blur(32px) saturate(1.8)",
                  }}
                >
                  {/* Panel header */}
                  <div
                    className="flex items-center justify-between px-5 pt-4 pb-3"
                    style={{ borderBottom: "1px solid var(--overlay-sm)" }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="inline-block w-1.5 h-1.5 rounded-full"
                        style={{
                          background: "var(--accent)",
                          boxShadow:
                            "0 0 8px var(--accent), 0 0 16px color-mix(in srgb, var(--accent) 18%, transparent)",
                          animation: "pulse 2.4s ease-in-out infinite",
                        }}
                      />
                      <span
                        className="text-[10px] font-mono tracking-[0.2em] uppercase"
                        style={{ color: "var(--border-a28)" }}
                      >
                        <InfoPopover
                          title="Temperature Control"
                          items={[
                            [
                              "Common misunderstandings about temperature",
                              "https://dev.to/hermup299/llm-predictability-vs-determinism-2idb",
                            ],
                          ]}
                        />
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex items-center justify-center w-6 h-6 rounded-lg transition-all duration-150 hover:bg-[var(--border)] hover:text-(--text)"
                      style={{
                        background: "var(--overlay-xs)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
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
                    background: "var(--glass)",
                    border:
                      "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
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
        <button
          type="button"
          onClick={onToggle}
          className="relative w-14 h-14 rounded-full flex items-center justify-center shadow-xl hover:scale-[1.07] active:scale-95 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
          style={{
            background: isOpen
              ? "color-mix(in srgb, var(--accent) 18%, transparent)"
              : "var(--glass)",
            backdropFilter: "blur(14px)",
            border: isOpen
              ? "1px solid color-mix(in srgb, var(--accent) 35%, transparent)"
              : "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
            boxShadow: isOpen
              ? "0 0 28px color-mix(in srgb, var(--accent) 18%, transparent), 0 4px 20px var(--bg-a50), 0 1px 0 var(--overlay-sm) inset"
              : "0 4px 20px var(--bg-a45), 0 1px 0 var(--overlay-sm) inset",
            color: "var(--accent)",
          }}
        >
          <SlidersHorizontal size={18} strokeWidth={1.5} />
          <span
            className="absolute inset-0 rounded-full pointer-events-none animate-ping [animation-duration:2.8s]"
            style={{
              border:
                "1px solid color-mix(in srgb, var(--accent) 15%, transparent)",
              background: "color-mix(in srgb, var(--accent) 4%, transparent)",
            }}
          />
        </button>
      </div>
    </>
  );
};
