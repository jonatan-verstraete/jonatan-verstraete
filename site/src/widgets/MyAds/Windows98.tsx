export const Win98 = () => (
  <a
    href="https://98.js.org/"
    target="_blank"
    rel="noreferrer"
    className="block size-full select-none"
    style={{
      background: "var(--overlay-a100-2)",
      fontFamily: "Arial, sans-serif",
    }}
  >
    <div
      className="flex items-center justify-between px-1.5 py-0.5"
      style={{
        background:
          "linear-gradient(90deg, var(--bg)082 0%, var(--c-1084d0) 100%)",
        height: "22px",
      }}
    >
      <div className="flex items-center gap-1">
        <span className="text-[10px]">🌐</span>
        <span className="text-white text-[11px] font-bold">Windows 98</span>
      </div>
      <div className="flex gap-0.5">
        {["_", "□", "✕"].map((c) => (
          <span
            key={c}
            className="flex items-center justify-center text-black text-[9px] font-bold"
            style={{
              width: 16,
              height: 14,
              background: "var(--overlay-a100-2)",
              borderTop: "1px solid var(--border-a100)",
              borderLeft: "1px solid var(--border-a100)",
              borderRight: "1px solid var(--shadow-a100-3)",
              borderBottom: "1px solid var(--shadow-a100-3)",
            }}
          >
            {c}
          </span>
        ))}
      </div>
    </div>
    <div className="flex flex-col items-center justify-center gap-2 p-3 h-[calc(100%-22px)]">
      <div className="text-3xl">💾</div>
      <p
        className="text-center font-black text-black leading-tight uppercase tracking-tight"
        style={{ fontSize: "clamp(15px, 3vw, 20px)" }}
      >
        DOOM
        <br />
        IN JAVASCRIPT
        <br />
        PLAY LIKE IT'S 1998
      </p>
      <p className="text-center text-[10px] text-(--shadow-a100-2) leading-snug px-1">
        Artisanal human-made technology.
      </p>
      <div
        className="mt-1 px-4 py-1 text-[11px] font-bold text-black text-center hover:scale-110"
        style={{
          background: "var(--overlay-a100-2)",
          borderTop: "2px solid var(--border-a100)",
          borderLeft: "2px solid var(--border-a100)",
          borderRight: "2px solid var(--shadow-a100-3)",
          borderBottom: "2px solid var(--shadow-a100-3)",
        }}
      >
        Click Here!
      </div>
    </div>
  </a>
);
