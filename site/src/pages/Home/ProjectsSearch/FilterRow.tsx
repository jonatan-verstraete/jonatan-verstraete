import { TagChip } from "@/components/TagChip";
import { type FilterItem } from "@/hooks/useRepoSearch";

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
    <div className="flex flex-wrap gap-1.5 flex-1 min-w-0">
      {items.map(({ name, count }) => (
        <TagChip
          key={name}
          name={name}
          count={count}
          active={filters.has(name)}
          onClick={() => onToggle(name)}
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
