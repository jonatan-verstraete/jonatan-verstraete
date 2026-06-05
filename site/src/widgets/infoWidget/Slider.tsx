import {
  checkpointOverridesAtom,
  checkpointsAtom,
  sliderValueAtom,
} from "@/store/checkPointStore";
import { useAtom, useAtomValue } from "jotai";
import { useCallback, useRef } from "react";

const TICKS = Array.from({ length: 21 }, (_, i) => i * 5);
const SCALE_LABELS = [0, 25, 50, 75, 100];

const getLabelOffset = (index: number, max = 25, stable = 1) =>
  Math.abs(Math.sin(index / stable) * max) - max / stable;

export const InfoWidgetSlider = () => {
  const [value, setValue] = useAtom(sliderValueAtom);
  const checkpoints = useAtomValue(checkpointsAtom);
  const overrides = useAtomValue(checkpointOverridesAtom);
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const applyClientX = useCallback(
    (clientX: number) => {
      if (!trackRef.current) return;
      const { left, width } = trackRef.current.getBoundingClientRect();
      setValue(
        Math.max(
          0,
          Math.min(100, Math.round(((clientX - left) / width) * 100)),
        ),
      );
    },
    [setValue],
  );

  return (
    <div className="select-none">
      {checkpoints.length > 0 && (
        <div className="relative h-7 mb-0.5">
          {checkpoints.map((cp, idx) => {
            const overridden = (overrides[cp.tag] ?? "auto") !== "auto";
            const active = value >= cp.percentage;
            return (
              <div
                key={`checkpoint-tag-${cp.tag}`}
                className="absolute bottom-0 flex flex-col items-center"
                style={{
                  left: `${cp.percentage}%`,
                  transform: `translate(-50%, ${getLabelOffset(idx)}px)`,
                }}
              >
                <span
                  className="text-[8px] font-mono uppercase tracking-wider whitespace-nowrap mb-1 transition-colors duration-300"
                  style={{
                    color: overridden
                      ? "var(--overlay-lg)"
                      : active
                        ? "var(--accent)"
                        : "var(--overlay-lg)",
                  }}
                >
                  {cp.tag}
                </span>
                <div
                  className="transition-colors duration-300"
                  style={{
                    width: 0,
                    height: 0,
                    borderLeft: "3px solid transparent",
                    borderRight: "3px solid transparent",
                    borderTop: `5px solid ${
                      overridden
                        ? "var(--overlay-md)"
                        : active
                          ? "var(--accent)"
                          : "var(--overlay-lg)"
                    }`,
                  }}
                />
              </div>
            );
          })}
        </div>
      )}

      <div
        ref={trackRef}
        id="visibility_slider_id"
        className="relative cursor-ew-resize"
        style={{ height: 32, touchAction: "none" }}
        onPointerDown={(e) => {
          dragging.current = true;
          e.currentTarget.setPointerCapture(e.pointerId);
          applyClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) applyClientX(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerCancel={() => {
          dragging.current = false;
        }}
        // onPointerLeave={() => {
        //   dragging.current = false;
        // }}
      >
        <div
          className="absolute inset-x-0 overflow-hidden"
          style={{
            top: "50%",
            transform: "translateY(-50%)",
            height: 8,
            borderRadius: 4,
          }}
        >
          <div
            className="absolute inset-0 rounded"
            style={{ background: "var(--overlay-sm)" }}
          />
          <div
            className="absolute inset-y-0 left-0"
            style={{
              width: `${value}%`,
              background:
                "linear-gradient(90deg, color-mix(in srgb, var(--accent) 55%, transparent) 0%, var(--accent) 100%)",
              boxShadow:
                "0 0 12px color-mix(in srgb, var(--accent) 40%, transparent)",
              transition: "width 0.04s",
            }}
          />
        </div>

        {TICKS.map((tick) => {
          const major = tick % 25 === 0;
          const mid = tick % 10 === 0;
          const lit = tick <= value;
          const h = major ? 14 : mid ? 9 : 5;
          return (
            <div
              key={`slider-tick-${tick}`}
              className="absolute pointer-events-none"
              style={{
                left: `${tick}%`,
                bottom: major ? 3 : mid ? 5 : 8,
                width: 1,
                height: h,
                background: lit ? "var(--accent-a45)" : "var(--overlay-md)",
                transform: "translateX(-50%)",
                borderRadius: 0.5,
                transition: "background 0.15s",
              }}
            />
          );
        })}

        {checkpoints.map((cp, idx) => {
          const overridden = (overrides[cp.tag] ?? "auto") !== "auto";
          const active = value >= cp.percentage;
          const indexOffset = getLabelOffset(idx);
          return (
            <div
              key={`tag-line-${cp.tag}`}
              className="absolute pointer-events-none z-10"
              style={{
                left: `${cp.percentage}%`,
                top: 2,
                bottom: 2,
                height: 25 + Math.abs(indexOffset),
                width: 2,
                borderRadius: 1,
                transform: `translate(-50%, ${indexOffset}px)`,
                background: overridden
                  ? "var(--overlay-md)"
                  : active
                    ? "var(--accent)"
                    : "var(--overlay-lg)",
                boxShadow:
                  !overridden && active
                    ? "0 0 8px 2px color-mix(in srgb, var(--accent) 35%, transparent)"
                    : "none",
                transition: "background 0.25s, box-shadow 0.25s",
              }}
            />
          );
        })}

        <div
          className="absolute top-0 bottom-0 flex items-center justify-center pointer-events-none z-20"
          style={{ left: `${value}%`, transform: "translateX(-50%)" }}
        >
          <div
            className="flex flex-col items-center justify-center gap-1"
            style={{
              width: 14,
              height: 26,
              borderRadius: 4,
              background:
                "linear-gradient(180deg, var(--border-a90) 0%, var(--thumb-hi) 100%)",
              boxShadow:
                "0 0 14px color-mix(in srgb, var(--accent) 50%, transparent), 0 3px 8px var(--bg-a60)",
            }}
          >
            {[0, 1].map((i) => (
              <div
                key={`thumb-line-${i}`}
                style={{
                  width: 6,
                  height: 1,
                  borderRadius: 1,
                  background: "var(--bg-a28)",
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="relative mt-1" style={{ height: 14 }}>
        {SCALE_LABELS.map((v) => (
          <span
            key={`scale-label-${v}`}
            className="absolute text-[8px] font-mono -translate-x-1/2 tabular-nums"
            style={{ left: `${v}%`, color: "var(--overlay-lg)" }}
          >
            {v}
          </span>
        ))}
      </div>
    </div>
  );
};
