import { useIsMobile } from "@/hooks/useDevice";
import { BLUE_DIM } from "@/widgets/infoWidget/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CardContent } from "./Content";
import { CardFooter } from "./Footer";
import { CardHeader } from "./Header";
import { Messages } from "./Messages";

const SESSION_KEY = "info-widget-visited";

export const WelcomeModal = () => {
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
                  <Messages />
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
