import {
  checkpointOverridesAtom,
  checkpointsAtom,
} from "@/store/checkPointStore";
import { useAtom, useAtomValue } from "jotai";
import { useCallback } from "react";
import { InfoWidgetSlider } from "./Slider";
import { getNextOverRideState } from "./utils";

export const InfoWidgetContent = () => {
  // const value = useAtomValue(sliderValueAtom);
  const checkpoints = useAtomValue(checkpointsAtom);
  const [overrides, setOverrides] = useAtom(checkpointOverridesAtom);

  const toggleOverride = useCallback(
    (tag: string) => setOverrides((prev) => getNextOverRideState(prev, tag)),
    [setOverrides],
  );

  return (
    <div>
      {/* <div className="flex items-center justify-between mb-3">
        <span
          className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md tabular-nums"
          style={{
            background: "color-mix(in srgb, var(--accent) 12%, transparent)",
            border: `1px solid color-mix(in srgb, var(--accent) 22%, transparent)`,
            color: "var(--accent)",
          }}
        >
          {value < 25
            ? "Zen"
            : value < 50
              ? "Focused"
              : value < 75
                ? "Enriched"
                : "Full"}{" "}
          · {value}%
        </span>
      </div> */}

      <InfoWidgetSlider />

      {checkpoints.length > 0 && (
        <div
          className="mt-5 pt-4 space-y-1.5"
          style={{ borderTop: "1px solid var(--overlay-sm)" }}
        >
          <p
            className="text-[9px] font-mono tracking-[0.22em] uppercase mb-2.5"
            style={{ color: "var(--overlay-lg)" }}
          >
            Checkpoint overrides
          </p>
          {checkpoints.map((cp) => {
            const override = overrides[cp.tag] ?? "auto";
            return (
              <div
                key={`override-${cp.tag}`}
                className="flex items-center justify-between gap-3 py-0.5"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300"
                    style={{
                      background:
                        override !== "auto" ? "var(--green)" : "var(--accent)",
                      boxShadow:
                        override !== "auto"
                          ? "0 0 5px color-mix(in srgb, var(--green) 60%, transparent)"
                          : "0 0 5px color-mix(in srgb, var(--accent) 18%, transparent)",
                    }}
                  />
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider truncate transition-colors duration-200"
                    style={{
                      color:
                        override !== "auto"
                          ? "var(--border-a70)"
                          : "var(--border-a35)",
                    }}
                  >
                    {cp.tag}
                  </span>
                  <span
                    className="text-[9px] font-mono tabular-nums shrink-0"
                    style={{ color: "var(--overlay-lg)" }}
                  >
                    @{cp.percentage}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => toggleOverride(cp.tag)}
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded-md shrink-0 transition-all duration-150"
                  style={{
                    background:
                      override === "on"
                        ? "color-mix(in srgb, var(--green) 12%, transparent)"
                        : override === "off"
                          ? "color-mix(in srgb, var(--red) 10%, transparent)"
                          : "var(--overlay-xs)",
                    border:
                      override === "on"
                        ? "1px solid color-mix(in srgb, var(--green) 30%, transparent)"
                        : override === "off"
                          ? "1px solid color-mix(in srgb, var(--red) 25%, transparent)"
                          : "1px solid var(--border)",
                    color:
                      override === "on"
                        ? "var(--green)"
                        : override === "off"
                          ? "var(--red)"
                          : "var(--overlay-lg)",
                  }}
                >
                  <span
                    className="w-1 h-1 rounded-full shrink-0"
                    style={{
                      background:
                        override === "on"
                          ? "var(--green)"
                          : override === "off"
                            ? "var(--red)"
                            : "var(--overlay-lg)",
                    }}
                  />
                  <span className="text-[9px] font-mono uppercase tracking-wider">
                    {override ?? "auto"}
                  </span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
