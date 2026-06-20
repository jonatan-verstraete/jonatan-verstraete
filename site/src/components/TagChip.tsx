import { getStackMeta } from "@/utils/stackMeta";

interface TagChipProps {
  name: string;
  active?: boolean;
  count?: number;
  onClick?: () => void;
}

export const TagChip = ({ name, active, count, onClick }: TagChipProps) => {
  const m = getStackMeta(name);
  const cls = `shrink-0 inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-micro leading-5 transition-all duration-150 ${
    active
      ? "border-(--accent)/60 bg-(--accent)/10 text-(--accent)"
      : onClick
        ? "border-(--border)/70 text-(--muted) hover:border-(--border) hover:text-(--text) cursor-pointer"
        : "border-(--border)/60 text-(--muted)"
  }`;

  const inner = (
    <>
      {m.bg !== "transparent" && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: m.bg }}
        />
      )}
      {m.label}
      {count !== undefined && (
        <span
          className={`tabular-nums ${active ? "opacity-60" : "opacity-40"}`}
        >
          {count}
        </span>
      )}
    </>
  );

  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cls}>
        {inner}
      </button>
    );
  }
  return <span className={cls}>{inner}</span>;
};
