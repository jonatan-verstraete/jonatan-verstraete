export const JsCanvas = () => (
  <a
    href="https://github.com/jayf0x/js-canvas"
    target="_blank"
    rel="noreferrer"
    className="relative block size-full overflow-hidden"
  >
    <img
      className="absolute inset-0 w-full h-full object-cover scale-110"
      src="https://raw.githubusercontent.com/jayf0x/js-canvas/main/previews/trees.gif"
    />

    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(to bottom, var(--c-321200-a50) 0%, var(--bg) 65%)",
      }}
    />

    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 3px, var(--c-d4a017-a2) 3px, var(--c-d4a017-a2) 4px)",
      }}
    />
    <div className="absolute inset-0 flex flex-col justify-between p-3">
      <div className="flex items-center">
        <span
          className="text-[7px] font-bold px-1.5 py-0.5 tracking-widest uppercase"
          style={{
            border: "1.5px solid var(--c-d4a017-a73)",
            color: "var(--c-d4a017-a80)",
            borderRadius: "2px",
            fontFamily: "monospace",
          }}
        >
          ✈ TOURISM BOARD OF EDO — EST. 1600
        </span>
      </div>

      <div>
        <p
          className="font-black leading-none uppercase"
          style={{
            fontSize: "clamp(28px, 6vw, 42px)",
            color: "var(--c-f5deb3)",
            textShadow: "0 0 40px var(--c-d4a017-a70), 2px 2px 0 var(--glass)",
            letterSpacing: "-0.03em",
          }}
        >
          Travel
          <br />
          Edo
          <br />
          Japan
        </p>
        <div
          className="mt-1.5 text-[8px] font-mono leading-5"
          style={{ color: "var(--c-d4a017-a53)", fontFamily: "monospace" }}
        >
          <p>YEAR: 1600 AD &nbsp;·&nbsp; WIFI: NONE ✓</p>
          <p>SAMURAI: ABSOLUTELY ✓</p>
          <p>RETURN TICKET: NOT REQUIRED ✓</p>
        </div>
        <div className="mt-2 flex items-end gap-2">
          <span
            className="inline-block text-[10px] font-black px-2.5 py-1 rounded-sm"
            style={{ background: "var(--c-d4a017)", color: "var(--bg)" }}
          >
            Take a live server and travel →
          </span>
          <span
            className="text-[7px] italic pb-0.5"
            style={{ color: "var(--c-d4a017-a27)" }}
          >
            *just JavaScript
          </span>
        </div>
      </div>
    </div>
  </a>
);
