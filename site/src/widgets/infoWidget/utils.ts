import { OverrideState } from "@/store/checkPointStore";

function cycleOverride(current: OverrideState): OverrideState {
  if (current === "auto") return "off";
  if (current === "off") return "on";
  if (current === "on") return "auto";
  return "off";
}

export const getNextOverRideState = (
  state: Record<string, OverrideState>,
  tag: string,
) => {
  const next = cycleOverride(state[tag]);
  if (next === "auto") {
    const { [tag]: _, ...rest } = state;
    return rest;
  }
  return { ...state, [tag]: next };
};
