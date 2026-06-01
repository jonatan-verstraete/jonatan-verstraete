export const Duck = () => (
  <a
    href="https://en.wikipedia.org/wiki/Duck_test"
    target="_blank"
    rel="noreferrer"
    className="relative block size-full overflow-hidden"
  >
    <img
      className="absolute inset-0 w-full h-full object-cover"
      style={{ filter: "contrast(1.3) saturate(0.7) brightness(0.85)" }}
      src="https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOXd1M2N2bnNqdGVydTU3cDcyaXM1ZjhubjNoZnJsam14enRiNTFseSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/1gQuJbdCaihTIqu2lB/giphy.gif"
    />

    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 40%, transparent 30%, var(--bg-a75) 100%)",
      }}
    />

    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, var(--c-002850-a45) 0%, var(--surface-a88) 75%)",
      }}
    />
    <div className="absolute inset-0 flex flex-col justify-between p-3">
      <div className="flex items-center gap-1.5">
        <span
          className="text-[8px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase"
          style={{ background: "var(--c-38bdf8)", color: "var(--bg)" }}
        >
          HEALTH PSA
        </span>
        <span className="text-sky-300/60 text-[9px] tracking-wide">
          Self-Care Division
        </span>
      </div>
      <div>
        <p
          className="text-white font-black leading-tight"
          style={{
            fontSize: "clamp(13px, 3vw, 17px)",
            textShadow: "0 2px 12px var(--bg-a80)",
          }}
        >
          Do you find yourself
          <br />
          talking to Ducks?
        </p>
        <p className="text-sky-200/60 text-[10px] mt-1">
          That's normal. Actually healthy.
        </p>
        <span
          className="mt-2 inline-block text-[10px] font-black px-2.5 py-1 rounded-sm"
          style={{ background: "var(--c-38bdf8)", color: "var(--bg)" }}
        >
          Take the Duck Test →
        </span>
        <p className="text-white/25 text-[7px] mt-1 italic">
          *Results may quack.
        </p>
      </div>
    </div>
  </a>
);
