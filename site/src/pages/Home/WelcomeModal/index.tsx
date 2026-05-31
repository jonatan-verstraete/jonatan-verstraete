import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { CardContent } from "./Content";
import { CardFooter } from "./Footer";
import { CardHeader } from "./Header";
import { MobileNotice } from "./Messages";

const SESSION_KEY = "welcome-modal-visited";

export const WelcomeModal = () => {
  const [isOpen, setIsOpen] = useState(
    () => !sessionStorage.getItem(SESSION_KEY),
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
            key="welcome-backdrop"
            className="fixed inset-0 z-90"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              background: "var(--bg-a80)",
              backdropFilter: "blur(20px)",
            }}
            onClick={handleClose}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="welcome-modal"
            className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6"
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            onClick={handleClose}
          >
            <div
              className="relative p-[1.5px] rounded-2xl w-full max-w-xl flex flex-col"
              style={{
                maxHeight: "min(90vh, 680px)",
                background:
                  "color-mix(in srgb, var(--accent) 18%, transparent)",
                boxShadow:
                  "0 32px 80px var(--bg-a70), 0 0 0 1px var(--overlay-sm) inset, 0 0 48px color-mix(in srgb, var(--accent) 7%, transparent)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="ip-snake" aria-hidden />

              <div
                className="relative z-10 rounded-[14.5px] flex flex-col overflow-hidden"
                style={{
                  background: "var(--glass)",
                  backdropFilter: "blur(32px) saturate(1.8)",
                  maxHeight: "inherit",
                }}
              >
                <MobileNotice />

                <div className="px-7 pt-7 pb-2 overflow-y-auto flex-1">
                  <CardHeader onClose={handleClose} />
                  <div className="mt-7">
                    <CardContent />
                  </div>
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
