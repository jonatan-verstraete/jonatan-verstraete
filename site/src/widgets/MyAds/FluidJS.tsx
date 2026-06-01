export const FluidJS = () => (
  <a
    href="https://www.npmjs.com/package/@jayf0x/fluidity-js"
    target="_blank"
    rel="noreferrer"
    className="relative block size-full overflow-hidden"
  >
    <div
      className="absolute inset-0 hue_rot"
      style={{
        background:
          "radial-gradient(ellipse at 25% 35%, var(--c-7c3aed) 0%, transparent 55%), radial-gradient(ellipse at 75% 65%, var(--c-0ea5e9) 0%, transparent 55%), radial-gradient(ellipse at 50% 80%, var(--c-ec4899) 0%, transparent 50%)",
        opacity: 0.9,
        animationDuration: "7s",
      }}
    />
    <div
      className="absolute inset-0 flex flex-col justify-between p-3"
      style={{
        background:
          "linear-gradient(to bottom, var(--glass-a72) 0%, transparent 45%, var(--glass) 72%)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase"
          style={{ background: "var(--c-4ade80)", color: "var(--bg)" }}
        >
          FREE
        </span>
        <span className="text-white/50 text-[9px] font-mono tracking-wide">
          NPM PACKAGE
        </span>
      </div>
      <div>
        <p
          className="text-white font-black leading-none"
          style={{ fontSize: "clamp(18px, 4vw, 26px)" }}
        >
          PHYSICS.
          <br />
          LIQUEFIED.
          <br />
          OPEN SOURCE.
        </p>
        <p className="text-white/45 text-[9px] mt-1 font-mono">
          bun add @jayf0x/fluidity-js
        </p>
        <span
          className="mt-2 inline-block text-[10px] font-bold px-2.5 py-1 rounded-sm"
          style={{
            background: "var(--overlay-lg)",
            color: "var(--border-a100)",
            backdropFilter: "blur(4px)",
            border: "1px solid var(--overlay-lg)",
          }}
        >
          Get it now →
        </span>
      </div>
    </div>
  </a>
);
