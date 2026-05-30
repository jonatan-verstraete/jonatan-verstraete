import { BLUE } from "@/widgets/infoWidget/utils";

export const CardFooter = ({ onClose }: { onClose: () => void }) => (
  <div
    className="px-7 py-4 flex items-center justify-end shrink-0"
    style={{ borderTop: "1px solid rgba(255,255,255,0.04)" }}
  >
    <button
      type="button"
      onClick={onClose}
      className="flex items-center gap-2 text-[12px] font-medium px-4 py-2 rounded-xl transition-all duration-200"
      style={{
        background: "color-mix(in srgb, var(--accent) 12%, transparent)",
        border: "1px solid color-mix(in srgb, var(--accent) 22%, transparent)",
        color: BLUE,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--accent) 22%, transparent)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLElement).style.background =
          "color-mix(in srgb, var(--accent) 12%, transparent)";
      }}
    >
      Continue
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <path
          d="M2 5h6M5.5 2l3 3-3 3"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  </div>
);
