import { X } from "lucide-react";

export const ActiveChips = ({
  query,
  filters,
  onClearQuery,
  onRemoveFilter,
}: {
  query: string;
  filters: Set<string>;
  onClearQuery: () => void;
  onRemoveFilter: (f: string) => void;
}) => (
  <div className="flex flex-wrap items-center justify-center gap-2">
    {query.trim() && (
      <button
        type="button"
        onClick={onClearQuery}
        className="group inline-flex items-center gap-1 rounded border border-(--border)/70 bg-(--surface) px-2 py-0.5 font-mono text-mini text-(--text) hover:border-(--accent)/50 transition-colors duration-100"
      >
        <span className="text-(--muted)/50">"</span>
        {query.trim()}
        <span className="text-(--muted)/50">"</span>
        <X
          size={9}
          className="ml-0.5 opacity-40 group-hover:opacity-80 transition-opacity"
        />
      </button>
    )}
    {Array.from(filters).map((f) => (
      <button
        key={f}
        type="button"
        onClick={() => onRemoveFilter(f)}
        className="group inline-flex items-center gap-1 rounded border border-(--accent)/60 bg-(--accent)/10 px-2 py-0.5 font-mono text-mini text-(--accent) hover:border-(--accent)/80 transition-colors duration-100"
      >
        {f}
        <X
          size={9}
          className="ml-0.5 opacity-60 group-hover:opacity-100 transition-opacity"
        />
      </button>
    ))}
  </div>
);
