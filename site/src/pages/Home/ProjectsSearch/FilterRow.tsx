import { type FilterItem } from "@/hooks/useRepoSearch";
import { getStackMeta } from "@/utils/stackMeta";

export const FilterRow = ({
  items,
  filters,
  onToggle,
  hasActiveFilters,
  onClearFilters,
}: {
  items: FilterItem[];
  filters: Set<string>;
  onToggle: (v: string) => void;
  hasActiveFilters?: boolean;
  onClearFilters?: () => void;
}) => (
  <div className="flex items-center gap-2">
    <div className="flex flex-wrap gap-1 flex-1 min-w-0">
      {items.map(({ name, count }) => (
        <FilterChip
          key={name}
          name={name}
          count={count}
          active={filters.has(name)}
          onToggle={() => onToggle(name)}
        />
      ))}
    </div>
    {hasActiveFilters && onClearFilters && (
      <button
        type="button"
        onClick={onClearFilters}
        className="shrink-0 font-mono text-micro text-(--muted) hover:text-(--accent) transition-colors"
      >
        clear
      </button>
    )}
  </div>
);

const FilterChip = ({
  name,
  count,
  active,
  onToggle,
}: {
  name: string;
  count: number;
  active: boolean;
  onToggle: () => void;
}) => {
  const m = getStackMeta(name);
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`shrink-0 inline-flex items-center gap-1 rounded border px-2 py-0.5 font-mono text-mini transition-all duration-150 ${
        active
          ? "border-(--accent)/60 bg-(--accent)/10 text-(--accent)"
          : "border-(--border)/70 text-(--muted) hover:border-(--border) hover:text-(--text)"
      }`}
    >
      {m.bg !== "transparent" && (
        <span
          className="inline-block h-1.5 w-1.5 rounded-full shrink-0"
          style={{ background: m.bg }}
        />
      )}
      {name}
      <span className={`tabular-nums ${active ? "opacity-60" : "opacity-40"}`}>
        {count}
      </span>
    </button>
  );
};
