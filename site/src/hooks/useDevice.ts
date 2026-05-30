import { isMobileAtom } from "@/store/generalStore";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

const MOBILE_BREAKPOINT = 768;

export const useRegisterIsMobile = () => {
  const setIsMobile = useSetAtom(isMobileAtom);

  return useCallback(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);

    const onChange = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);

    mql.addEventListener("change", onChange);
    return () => {
      mql.removeEventListener("change", onChange);
    };
  }, [setIsMobile]);
};

export const useIsMobile = () => useAtomValue(isMobileAtom);
