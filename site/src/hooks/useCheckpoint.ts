import { CheckPointTag } from "@/config";
import {
  checkpointOverridesAtom,
  checkpointsAtom,
  sliderValueAtom,
  type CheckpointItem,
} from "@/store/checkPointStore";
import { useAtomValue, useSetAtom } from "jotai";
import { useCallback } from "react";

export const useRegisterCheckpoints = () => {
  const setCheckpoints = useSetAtom(checkpointsAtom);

  const updateCheckpoints = useCallback(
    (checkpoints: CheckpointItem[]) =>
      setCheckpoints((prev) => {
        const updated = prev.slice();
        for (const item of checkpoints) {
          const idx = updated.findIndex(({ tag }) => tag === item.tag);
          if (idx >= 0) {
            updated[idx] = item;
          } else {
            updated.push(item);
          }
        }

        return updated;
      }),
    [setCheckpoints],
  );

  return updateCheckpoints;
};

export const useCheckpointValue = (tag: CheckPointTag) => {
  const sliderValue = useAtomValue(sliderValueAtom);
  const checkpoints = useAtomValue(checkpointsAtom);

  const overrides = useAtomValue(checkpointOverridesAtom);

  const override = overrides[tag] ?? "auto";
  if (override === "on") return true;
  if (override === "off") return false;

  const item = checkpoints.find((c) => c.tag === tag);

  if (!item) return false;

  return item.invert
    ? sliderValue <= item.percentage
    : sliderValue >= item.percentage;
};
