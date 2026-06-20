import { X } from "lucide-react";

export const CardHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="flex items-center gap-2 mb-2.5">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: "var(--accent)",
            boxShadow:
              "0 0 8px var(--accent), 0 0 16px color-mix(in srgb, var(--accent) 40%, transparent)",
            animation: "pulse 2.4s ease-in-out infinite",
          }}
        />
        <span
          className="text-[9px] font-mono tracking-[0.28em] uppercase"
          style={{
            color: "color-mix(in srgb, var(--accent) 55%, transparent)",
          }}
        >
          Welcome
        </span>
      </div>
      <h1
        className="text-2xl font-semibold tracking-tight leading-tight"
        style={{
          background:
            "linear-gradient(110deg, var(--text) 0%, var(--accent) 55%, var(--text) 100%)",
          backgroundSize: "200% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          animation: "shimmer 3.5s ease-in-out infinite",
        }}
      >
        Welcome to my corner of the internet
      </h1>
    </div>

    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      className="shrink-0 mt-0.5 flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 bg-white/4 hover:bg-white/8 border border-white/7 text-(--muted) hover:text-(--text)"
    >
      <X size={10} strokeWidth={2} />
    </button>
  </div>
);
