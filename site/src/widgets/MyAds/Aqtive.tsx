import { TypeAnimation } from "react-type-animation";

export const Aqtive = () => (
  <a
    href="https://github.com/jayf0x/Aqtive"
    target="_blank"
    rel="noreferrer"
    className="relative block size-full overflow-hidden"
    style={{ background: "var(--bg)" }}
  >
    <div
      className="absolute inset-0 animate-pulse"
      style={{
        background:
          "radial-gradient(ellipse at 50% 65%, var(--c-00ff00-a10) 0%, transparent 70%)",
        animationDuration: "2s",
      }}
    />
    <div className="size-full flex flex-col items-center justify-center gap-3 p-3 relative">
      <div className="relative">
        <span className="text-4xl">☕</span>
        <span className="absolute -top-1 -right-1 flex size-3.5">
          <span className="animate-ping absolute inline-flex size-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex size-3.5 rounded-full bg-green-400" />
        </span>
      </div>
      <TypeAnimation
        sequence={[
          "AWAKE.",
          1100,
          "CAFFEINATED.",
          1100,
          "ONLINE.",
          1000,
          "UNSTOPPABLE.",
          1400,
          "NEVER SLEEPING.",
          1600,
          "INVINCIBLE.",
          1200,
        ]}
        speed={45}
        repeat={Infinity}
        omitDeletionAnimation
        className="font-black text-center leading-none uppercase"
        style={{
          fontSize: "clamp(18px, 4.5vw, 26px)",
          color: "var(--c-4ade80)",
          textShadow:
            "0 0 20px var(--c-4ade80-a60), 0 0 50px var(--c-4ade80-a27)",
        }}
      />
      <p
        className="text-[9px] text-center"
        style={{ color: "var(--c-4ade80-a20)" }}
      >
        Aqtive — keeps your Mac alive →
      </p>
    </div>
  </a>
);
