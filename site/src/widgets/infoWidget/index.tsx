import { useIsMobile } from "@/hooks/useDevice";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal, X } from "lucide-react";
import { useState } from "react";
import { InfoWidgetContent } from "./Content";
import { BLUE, BLUE_DIM, BLUE_GLOW, BLUE_MID } from "./utils";

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
              className="fixed inset-0 z-80"
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
                  ? "fixed inset-x-0 bottom-0 z-90 p-3"
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
