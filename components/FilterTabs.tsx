import type { Filter } from "../types";

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
];

interface FilterTabsProps {
  filter: Filter;
  onChange: (filter: Filter) => void;
  completedCount: number;
  onClearCompleted: () => void;
}

export function FilterTabs({
  filter,
  onChange,
  completedCount,
  onClearCompleted,
}: FilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 mb-5">
      <div
        className="inline-flex rounded-[12px] border border-border bg-canvas-alt p-[3px]"
        role="tablist"
        aria-label="Filter tasks"
      >
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`rounded-[7px] px-4 py-2 text-xs font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 ${
              filter === key
                ? "bg-card text-text shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                : "text-text-muted hover:text-text"
            }`}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button
          type="button"
          className="rounded-[6px] px-2.5 py-2 text-xs font-medium text-danger transition duration-200 hover:bg-[rgba(239,83,80,0.1)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
          onClick={onClearCompleted}
        >
          Clear completed ({completedCount})
        </button>
      )}
    </div>
  );
}
