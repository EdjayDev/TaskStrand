import { useRef } from "react";
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
  counts?: Partial<Record<Filter, number>>;
}

export function FilterTabs({
  filter,
  onChange,
  completedCount,
  onClearCompleted,
  counts,
}: FilterTabsProps) {
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    const currentIndex = FILTERS.findIndex(({ key }) => key === filter);

    let nextIndex: number | null = null;

    if (event.key === "ArrowRight") {
      nextIndex = (currentIndex + 1) % FILTERS.length;
    } else if (event.key === "ArrowLeft") {
      nextIndex = (currentIndex - 1 + FILTERS.length) % FILTERS.length;
    } else if (event.key === "Home") {
      nextIndex = 0;
    } else if (event.key === "End") {
      nextIndex = FILTERS.length - 1;
    }

    if (nextIndex === null) {
      return;
    }

    event.preventDefault();

    const nextKey = FILTERS[nextIndex].key;

    onChange(nextKey);
    tabRefs.current[nextKey]?.focus();
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
      <div
        className="inline-flex rounded-[12px] border border-border bg-canvas-alt p-[3px]"
        role="tablist"
        aria-label="Filter tasks"
        onKeyDown={handleKeyDown}
      >
        {FILTERS.map(({ key, label }) => {
          const count = counts?.[key];
          const isActive = filter === key;

          return (
            <button
              key={key}
              ref={(node) => {
                tabRefs.current[key] = node;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              className={`flex items-center gap-1.5 rounded-[7px] px-4 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 ${
                isActive
                  ? "bg-card text-text shadow-[0_2px_6px_rgba(0,0,0,0.25)]"
                  : "text-text-muted hover:text-text hover:bg-white/[0.03]"
              }`}
              onClick={() => onChange(key)}
            >
              {label}
              {typeof count === "number" && (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] leading-none transition-colors ${
                    isActive
                      ? "bg-thread/15 text-thread"
                      : "bg-white/[0.06] text-text-faint"
                  }`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <button
        type="button"
        disabled={completedCount === 0}
        className={`rounded-[6px] px-2.5 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 ${
          completedCount === 0
            ? "pointer-events-none text-text-faint/40 opacity-0"
            : "text-danger opacity-100 hover:bg-[rgba(239,83,80,0.1)]"
        }`}
        onClick={onClearCompleted}
      >
        Clear completed ({completedCount})
      </button>
    </div>
  );
}