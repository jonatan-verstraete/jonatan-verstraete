import { getStackMeta } from "@/utils/stackMeta";

export const FilterRow = ({
  label,
  items,
  filters,
  onToggle,
}: {
  label: string;
  items: string[];
  filters: Set<string>;
  onToggle: (v: string) => void;
}) => (
  <div className="flex flex-col gap-1">
    <span className="font-mono text-[10px] uppercase tracking-widest text-(--muted)">
      {label}
    </span>
    <div className="flex gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden">
      {items.map((name) => (
        <FilterItem
          key={name}
          name={name}
          active={filters.has(name)}
          onToggle={() => onToggle(name)}
        />
      ))}
    </div>
  </div>
);

const FilterItem = ({
  name,
  active,
  onToggle,
}: {
  name: string;
  active: boolean;
  onToggle: () => void;
}) => {
  const m = getStackMeta(name);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`shrink-0 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs transition-all duration-150 ${
        active
          ? "border-(--accent) bg-(--accent)/15 text-(--accent)"
          : "border-(--border) text-(--muted) hover:border-(--accent)/50 hover:text-(--text) hover:bg-(--surface)"
      }`}
    >
      {m.bg !== "transparent" && (
        <span
          className="inline-block h-2 w-2 rounded-sm shrink-0"
          style={{ background: m.bg }}
        />
      )}
      {name}
    </button>
  );
};
