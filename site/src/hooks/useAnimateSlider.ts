import { animate } from "framer-motion";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

import { sliderValueAtom } from "@/store/checkPointStore";

export const useAnimateSlider = ({
  sequence,
  duration,
}: {
  sequence: number[];
  duration: number;
}) => {
  const value = useAtomValue(sliderValueAtom);
  const setValue = useSetAtom(sliderValueAtom);

  return useCallback(async () => {
    const start = value;
    let current = start;

    for (const delta of sequence) {
      const target = Math.max(0, Math.min(100, start + delta));

      await new Promise<void>((resolve) => {
        const controls = animate(current, target, {
          duration,
          ease: "easeInOut",

          onUpdate: (latest) => {
            current = latest;
            setValue(Math.round(latest));
          },

          onComplete: () => {
            resolve();
          },
        });

        return () => controls.stop();
      });
    }
  }, [value, sequence, duration, setValue]);
};
