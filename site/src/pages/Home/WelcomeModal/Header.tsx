import { BLUE } from "@/widgets/infoWidget/utils";

export const CardHeader = ({ onClose }: { onClose: () => void }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <div className="flex items-center gap-2 mb-1">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{
            background: BLUE,
            boxShadow: `0 0 8px ${BLUE}, 0 0 16px rgba(79,124,255,0.4)`,
            animation: "pulse 2.4s ease-in-out infinite",
          }}
        />
        <span
          className="text-[9px] font-mono tracking-[0.28em] uppercase"
          style={{ color: "rgba(79,124,255,0.55)" }}
        >
          Welcome
        </span>
      </div>
      <h1
        className="text-2xl font-semibold tracking-tight mb-1"
        style={{ color: "var(--text)" }}
      >
        <span
          className="relative inline-block"
          style={{
            background:
              "linear-gradient(110deg, var(--text) 0%, var(--accent) 55%, var(--text) 100%)",
            backgroundSize: "200% 100%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            animation: "shimmer 3.5s ease-in-out infinite",
          }}
        >
          Welcome to my corner of the internet!
        </span>
      </h1>
    </div>

    <button
      type="button"
      onClick={onClose}
      className="flex items-center justify-center w-7 h-7 rounded-lg transition-all duration-150 shrink-0 mt-0.5"
      style={{
        background: "rgba(255,255,255,0.04)",
        border: "1px solid rgba(255,255,255,0.07)",
        color: "var(--muted)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLElement).style.color = "var(--text)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "rgba(255,255,255,0.04)";
        (e.currentTarget as HTMLElement).style.color = "var(--muted)";
      }}
    >
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M1 1l8 8M9 1l-8 8"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
    </button>
  </div>
);
