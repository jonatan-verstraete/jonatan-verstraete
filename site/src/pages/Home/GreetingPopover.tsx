import { useIsMobile } from "@/hooks/useIsMobile";
import { Popover } from "@/lib/popover";
import { useState } from "react";

import { motion } from "framer-motion";

export const GreetingPopover = () => {
  const isMobile = useIsMobile();

  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex flex-row items-center gap-1 fixed left-1/2 top-1/4 z-[100]">
      <Popover
        trigger="click"
        onOpenChange={setIsOpen}
        padding={8}
        isOpen={isOpen}
        content={<PopoverContent />}
      >
        <button
          type="button"
          className={`flex items-center justify-center rounded-full transition-all duration-200 size-4.5`}
        >
          hoi
        </button>
      </Popover>
    </div>
  );
};

const PopoverContent = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.94, y: 6 }}
    animate={{ opacity: 1, scale: 1, y: 0 }}
    transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
    className="relative p-[1.5px] rounded-2xl w-1/2"
    style={{
      background: "var(--accent-dim)",
      boxShadow: "0 24px 64px var(--bg-a65), 0 0 0 1px var(--overlay-xs) inset",
    }}
  >
    <div className="ip-snake" aria-hidden />

    <div className="relative z-10 backdrop-blur-[28px] backdrop-saturate-200 rounded-[14.5px] overflow-hidden min-w-75 w-lvw bg-glass">
      heyyy
    </div>
  </motion.div>
);
