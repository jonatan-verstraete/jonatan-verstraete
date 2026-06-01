import { useEffect, useState } from "react";

const DIRTY = "shop.com/item?id=42&utm_source=fb&fbclid=abc&ref=feed";
const CLEAN = "shop.com/item?id=42";

export const PurePaste = () => {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);

  useEffect(() => {
    const seq: [number, 0 | 1 | 2][] = [
      [2200, 1],
      [3600, 2],
      [5800, 0],
    ];
    let i = 0;
    const step = () => {
      const [delay, next] = seq[i % seq.length];
      return setTimeout(() => {
        setPhase(next);
        i++;
        timerId = step();
      }, delay);
    };
    let timerId = step();
    return () => clearTimeout(timerId);
  }, []);

  return (
    <a
      href="https://github.com/jayf0x/Pure-Paste"
      target="_blank"
      rel="noreferrer"
      className="block size-full"
      style={{ background: "var(--surface)" }}
    >
      <div className="size-full flex flex-col justify-between p-4">
        <div>
          <p
            className="text-white font-black leading-none uppercase tracking-tight"
            style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}
          >
            TRACKERS
            <br />
            EXECUTED.
            <br />
            PASTE CLEAN.
          </p>
          <p className="text-white/30 text-[9px] mt-1">Private by default.</p>
        </div>
        <div
          className="w-full rounded p-2 font-mono text-[9px] break-all leading-relaxed"
          style={{
            background: "var(--overlay-xs)",
            border: "1px solid var(--border)",
          }}
        >
          {phase === 0 && <span style={{ color: "var(--red)" }}>{DIRTY}</span>}
          {phase === 1 && (
            <>
              <span style={{ color: "var(--c-4ade80)" }}>
                shop.com/item?id=42
              </span>
              <span
                style={{
                  color: "var(--red)",
                  textDecoration: "line-through",
                  opacity: 0.5,
                }}
              >
                &utm_source=fb&fbclid=abc&ref=feed
              </span>
            </>
          )}
          {phase === 2 && (
            <span style={{ color: "var(--c-4ade80)" }}>{CLEAN}</span>
          )}
        </div>
        <p className="text-white/25 text-[9px]">Pure-Paste →</p>
      </div>
    </a>
  );
};
