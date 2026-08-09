import { useState } from "react";
import type { Filter } from "../types";

interface EmptyStateProps {
  filter: Filter;
  className?: string;
}

interface FilterCopy {
  title: string;
  body: string;
  tip: string;
}

const COPY: Record<Filter, FilterCopy> = {
  all: {
    title: "No threads pinned yet",
    body: "Add your first task above to start the strand.",
    tip: "Press 'N' or click the input field above to quickly create your first task.",
  },
  active: {
    title: "Nothing left pending",
    body: "Every pinned task is done, or the strand is empty.",
    tip: "Nice work! You can switch to 'Completed' to review tasks you've finished today.",
  },
  completed: {
    title: "No completed tasks yet",
    body: "Finished tasks will pin here as you check them off.",
    tip: "Click the checkbox next to any active task when you finish it to archive it here.",
  },
};

export function EmptyState({ filter, className = "" }: EmptyStateProps) {
  const { title, body, tip } = COPY[filter] ?? COPY.all;
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`text-center px-4 py-14 text-text-muted ${className}`}
      role="status"
      aria-live="polite"
    >
      <div
        className="mx-auto mb-4 h-3.5 w-3.5 rounded-full border-2 border-dashed border-border-strong"
        aria-hidden="true"
      />

      <div className="flex items-center justify-center gap-2 mb-2">
        <h3 className="font-display text-xl font-semibold text-text">
          {title}
        </h3>

        {/* Question Mark Tooltip Trigger */}
        <div className="relative inline-flex items-center">
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 rounded-full border border-border-strong text-text-muted text-xs font-semibold hover:border-text hover:text-text focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-border-strong transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onFocus={() => setShowTooltip(true)}
            onBlur={() => setShowTooltip(false)}
            aria-label="Suggestion"
          >
            ?
          </button>

          {/* Tooltip Popup */}
          {showTooltip && (
            <div
              role="tooltip"
              className="absolute bottom-full mb-2.5 left-1/2 -translate-x-1/2 w-56 p-2.5 bg-bg-inverse text-text-inverse text-xs rounded-lg shadow-lg pointer-events-none z-10 transition-opacity duration-150 animate-in fade-in"
            >
              <span className="font-semibold block mb-0.5 text-amber-300">
                Tip:
              </span>
              {tip}
              {/* Tooltip Arrow */}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-bg-inverse" />
            </div>
          )}
        </div>
      </div>

      <p className="text-sm leading-7">{body}</p>
    </div>
  );
}
