import { useIsMobile } from "@/hooks/useDevice";
import { AnimatePresence, motion } from "framer-motion";

export const MobileNotice = () => {
  const isMobile = useIsMobile();

  return (
    <AnimatePresence>
      {isMobile && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.22 }}
          className="overflow-hidden shrink-0"
        >
          <div
            className="flex items-start gap-3 px-5 py-3"
            style={{
              background:
                "linear-gradient(135deg, var(--amber-glow) 0%, color-mix(in srgb, var(--amber) 4%, transparent) 100%)",
              borderBottom: "1px solid var(--amber-border)",
            }}
          >
            <span className="text-sm shrink-0 mt-px select-none">⚠</span>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--amber-text)" }}
            >
              Some interactions work best on a larger screen.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
