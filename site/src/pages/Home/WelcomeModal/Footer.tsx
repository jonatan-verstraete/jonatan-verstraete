import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export const CardFooter = ({ onClose }: { onClose: () => void }) => (
  <div
    className="px-7 py-4 flex items-center justify-between shrink-0"
    style={{ borderTop: "1px solid var(--overlay-sm)" }}
  >
    <span className="text-xs" style={{ color: "var(--overlay-lg)" }}>
      Click anywhere outside to dismiss
    </span>

    <motion.button
      type="button"
      onClick={onClose}
      className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-xl"
      style={{
        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
        color: "var(--accent)",
      }}
      whileHover={{
        background: "color-mix(in srgb, var(--accent) 22%, transparent)",
      }}
      transition={{ duration: 0.15 }}
    >
      Let&apos;s go
      <ArrowRight size={11} strokeWidth={2} />
    </motion.button>
  </div>
);
