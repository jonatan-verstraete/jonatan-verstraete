const Redact = ({ w }: { w: number }) => (
  <span
    className="inline-block rounded-sm align-middle mx-0.5"
    style={{
      width: `${w}ch`,
      height: "1em",
      background: "var(--border-a88)",
      verticalAlign: "middle",
    }}
  />
);

export const Piipaya = () => (
  <a
    href="https://github.com/jayf0x/PIIPAYA"
    target="_blank"
    rel="noreferrer"
    className="relative block size-full"
    style={{ background: "var(--surface)" }}
  >
    <div className="size-full flex flex-col justify-between p-4">
      <div>
        <p
          className="text-white font-black leading-none uppercase tracking-tight"
          style={{ fontSize: "clamp(16px, 3.5vw, 22px)" }}
        >
          THE FEDS
          <br />
          CAN'T
          <br />
          READ THIS.
        </p>
        <p className="text-white/30 text-[9px] mt-1 tracking-wide">
          Local AI · No cloud · No logs
        </p>
      </div>
      <div
        className="w-full rounded-md p-3 font-mono text-[11px] leading-6 text-white/80"
        style={{
          background: "var(--overlay-xs)",
          border: "1px solid var(--border)",
        }}
      >
        <p>
          Dear <Redact w={7} />,
        </p>
        <p>
          Your <Redact w={5} /> at <Redact w={3} />@<Redact w={5} />
          .com
        </p>
        <p>
          is now <span style={{ color: "var(--c-4ade80)" }}>anonymous.</span>
        </p>
      </div>
      <p className="text-white/25 text-[9px] tracking-wide">PIIPAYA →</p>
    </div>
  </a>
);
