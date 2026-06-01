import { TypeAnimation } from "react-type-animation";

export const MatrixRain = () => (
  <div className="relative size-full bg-black overflow-hidden">
    <img
      className="absolute inset-0 w-full h-full object-cover opacity-80"
      src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExdjU5N2l2eGo0aWZzbDJnNGFkOWM5Y3cyd3lrbzVtOGwyejk1Mnc5YyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/4heseFMvObk9q/giphy.gif"
    />
    <div
      className="absolute inset-0 flex flex-col justify-between p-3"
      style={{
        background:
          "linear-gradient(to bottom, var(--bg-a60) 0%, transparent 40%, var(--bg-a80) 65%)",
      }}
    >
      <div className="flex items-center gap-1.5">
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm tracking-widest uppercase"
          style={{ background: "var(--c-ff5544)", color: "var(--bg)" }}
        >
          LIVE
        </span>
        <span className="text-(--c-00cc44) text-[10px] font-mono opacity-70">
          MARKET FEED
        </span>
      </div>
      <div>
        <TypeAnimation
          sequence={["RED", 2200, "RED -50%", 2000, "BUY RED", 2200]}
          speed={20}
          repeat={Infinity}
          omitDeletionAnimation
          className="font-black text-2xl leading-none block"
          style={{
            color: "var(--c-ff5544)",
            textShadow: "0 0 12px var(--c-ff5544-a20)",
          }}
        />
        <p className="text-white/70 text-[11px] mt-0.5">
          Trade crypto. Break free.
        </p>
        <span
          className="mt-2 inline-block text-[10px] font-bold px-2.5 py-1 rounded"
          style={{ background: "var(--c-ff5544)", color: "var(--bg)" }}
        >
          Trade Now →
        </span>
      </div>
    </div>
  </div>
);
