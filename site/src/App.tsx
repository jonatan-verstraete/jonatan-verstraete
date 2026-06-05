import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useMemo, useRef } from "react";
import { Background } from "./components/Background";

import {
  useCheckpointValue,
  useRegisterCheckpoints,
} from "./hooks/useCheckpoint";
import { useIsMobile, useRegisterIsMobile } from "./hooks/useDevice";

import { useAtomValue } from "jotai";
import { Header } from "./components/Header";
import { allCheckpointItems, PageName } from "./config";
import { Home } from "./pages/Home";
import { Resume } from "./pages/Resume";
import { currentPageAtom } from "./store/generalStore";
import { WidgetsContainer } from "./widgets";

const mappedPages: Record<PageName, () => React.JSX.Element> = {
  "127.0.0.1": Home,
  Résumé: Resume,
};

export const App = () => {
  const isMobile = useIsMobile();

  const watchIsMobile = useRegisterIsMobile();
  const registerCheckpoints = useRegisterCheckpoints();

  const isVoid = useCheckpointValue("Void");
  const currentPage = useAtomValue(currentPageAtom);
  const pageVariants = usePageAnimation(currentPage);

  const CurrentPage = isVoid ? null : mappedPages[currentPage];

  useEffect(() => {
    watchIsMobile();
    registerCheckpoints(allCheckpointItems);
  }, [watchIsMobile, registerCheckpoints]);

  return (
    <div className="h-screen w-screen text-text">
      <WidgetsContainer />
      <Background />
      <main
        className="relative z-20 pointer-events-none"
        style={{
          display: isVoid ? "none" : "",
        }}
      >
        <AnimatePresence mode="popLayout">
          <motion.div
            key={`motion-page-${currentPage}`}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.842, ease: "anticipate" }}
          >
            <div
              className={`flex flex-col relative bg-(--bg-a20) pointer-events-auto isolate ${isMobile ? "w-full h-[120vh]" : "w-[60%] m-auto h-[90vh] mt-[5vh] rounded-xl"}`}
              style={{
                backdropFilter: "blur(10px) brightness(0.4)",
              }}
            >
              <Header />

              {!!CurrentPage && <CurrentPage />}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const loosePages = Object.entries(mappedPages);

const usePageAnimation = (page: PageName) => {
  const prevRef = useRef(page);

  const prevIndex = loosePages.findIndex(
    ([label]) => label === prevRef.current,
  );
  const nextIndex = loosePages.findIndex(([label]) => label === page);

  const dir = prevIndex < nextIndex ? 1 : -1;
  const w = typeof window !== "undefined" ? window.innerWidth * dir : 0;

  useEffect(() => {
    prevRef.current = page;
  }, [page]);

  return useMemo(() => {
    return {
      initial: { x: w },
      animate: { x: 0 },
      exit: { x: -w },
    };
  }, [w]);
};
