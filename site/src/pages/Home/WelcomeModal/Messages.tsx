import { useIsMobile } from "@/hooks/useDevice";
import { AnimatePresence, motion } from "framer-motion";

export const Messages = () => {
  const isMobile = useIsMobile();
  return (
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
                  a larger screen is recommended.
                </span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
