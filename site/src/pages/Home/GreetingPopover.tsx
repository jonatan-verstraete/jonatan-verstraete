import { InfoPopover } from "@/components/InfoPopover";
import { useIsMobile } from "@/hooks/useDevice";
import { InfoWidgetContent } from "@/widgets/infoWidget/Content";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

const SESSION_KEY = "info-widget-visited";

const BLUE = "var(--accent)";
const BLUE_DIM = "color-mix(in srgb, var(--accent) 15%, transparent)";

export const GreetingPopover = () => {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = useState(
    () => true, //!sessionStorage.getItem(SESSION_KEY),
  );

  const handleClose = () => {
    sessionStorage.setItem(SESSION_KEY, "1");
    setIsOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="greeting-backdrop"
            className="fixed inset-0 z-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "rgba(4,4,8,0.75)",
              backdropFilter: "blur(16px)",
            }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="greeting-modal"
            className={isMobile ? "fixed inset-0 z-100" : "fixed inset-4 z-100"}
            initial={{ opacity: 0, scale: 0.97, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          >
            <div
              className="relative p-[1.5px] rounded-2xl h-full"
              style={{
                background: BLUE_DIM,
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
                <div className="px-7 pt-6 pb-7 flex-1 overflow-y-auto">
                  <WarningMessage isMobile={isMobile} />
                  <CardHeader onClose={handleClose} />

                  <div
                    className="mb-5"
                    style={{ height: 1, background: "rgba(255,255,255,0.05)" }}
                  />

                  <CardContent />
                </div>

                <CardFooter onClose={handleClose} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const CardContent = () => (
  <>
    <InfoWidgetContent />
    <InfoPopover items={[["Example link"]]} forceOpen={true} />
  </>
);

const CardHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: BLUE,
            boxShadow: `0 0 8px ${BLUE}, 0 0 16px rgba(79,124,255,0.4)`,
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
          Welcome to my corner of the internet!
        </span>
      </h1>
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
);

const CardFooter = ({ onClose }: { onClose: () => void }) => (
  <div
    className="px-7 py-4 flex items-center justify-end shrink-0"
    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
  >
    <button
      type="button"
      onClick={onClose}
      className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-xl transition-all duration-200"
      style={{
        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
        color: BLUE,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--accent) 22%, transparent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--accent) 12%, transparent)";
      }}
    >
      Continue
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
);

const WarningMessage = ({ isMobile }: { isMobile: boolean }) => (
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
            style={{ filter: "drop-shadow(0 0 6px rgba(245,158,11,0.6))" }}
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
);
