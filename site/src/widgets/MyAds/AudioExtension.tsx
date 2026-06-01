import { useEffect, useState } from "react";

const RED_BAR_COLORS = [
  "var(--c-4d0000)",
  "var(--c-660000)",
  "var(--c-800000)",
  "var(--c-990000)",
  "var(--c-b30000)",
  "var(--c-cc0000)",
  "var(--c-e60000)",
  "var(--c-ff0000)",
  "var(--c-e60000)",
  "var(--c-cc0000)",
  "var(--c-b30000)",
  "var(--c-990000)",
  "var(--c-800000)",
  "var(--c-ff1a1a)",
];

export const AudioExtension = () => {
  const COUNT = 14;
  const [bars, setBars] = useState(() =>
    Array.from({ length: COUNT }, () => 0.15 + Math.random() * 0.8),
  );

  useEffect(() => {
    const id = setInterval(() => {
      setBars(Array.from({ length: COUNT }, () => 0.1 + Math.random() * 0.85));
    }, 160);
    return () => clearInterval(id);
  }, []);

  return (
    <a
      href="https://github.com/jayf0x/audio-bonanza"
      target="_blank"
      rel="noreferrer"
      className="relative block size-full overflow-hidden"
      style={{ background: "var(--bg)" }}
    >
      <div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-ff0000-a4) 3px, var(--c-ff0000-a4) 4px)",
        }}
      />

      <div
        className="absolute bottom-0 left-0 right-0 flex items-end gap-px px-1"
        style={{ height: "45%" }}
      >
        {bars.map((h, i) => (
          <div
            key={i}
            className="flex-1"
            style={{
              height: `${h * 100}%`,
              background: RED_BAR_COLORS[i % RED_BAR_COLORS.length],
              transition: "height 0.16s ease",
              boxShadow: `0 0 6px ${RED_BAR_COLORS[i % RED_BAR_COLORS.length]}88`,
            }}
          />
        ))}
      </div>

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(to bottom, var(--bg) 0%, var(--bg) 40%, transparent 100%)",
        }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-start pt-3 px-2 text-center z-10">
        <span
          className="text-[7px] font-bold tracking-widest uppercase mb-2"
          style={{ color: "var(--c-ff0000-a60)", fontFamily: "monospace" }}
        >
          JOIN NOW
        </span>
        <p
          className="font-black leading-none uppercase"
          style={{
            fontSize: "clamp(20px, 5vw, 28px)",
            color: "var(--c-ff0000)",
            textShadow:
              "0 0 20px var(--c-ff0000-a80), 0 0 50px var(--c-ff0000-a33)",
            letterSpacing: "-0.02em",
          }}
        >
          TAKE
          <br />
          OWNERSHIP
          <br />
          OF YOUR
          <br />
          SOUND
        </p>
        <p
          className="text-[8px] mt-2 tracking-widest uppercase font-bold"
          style={{ color: "var(--c-ff0000-a33)" }}
        >
          TAKE CONTROL
        </p>
      </div>
    </a>
  );
};
