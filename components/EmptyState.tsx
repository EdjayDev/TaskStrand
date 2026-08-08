import type { Filter } from "../types";

interface EmptyStateProps {
  filter: Filter;
}

const COPY: Record<Filter, { title: string; body: string }> = {
  all: {
    title: "No threads pinned yet",
    body: "Add your first task above to start the strand.",
  },
  active: {
    title: "Nothing left pending",
    body: "Every pinned task is done, or the strand is empty.",
  },
  completed: {
    title: "No completed tasks yet",
    body: "Finished tasks will pin here as you check them off.",
  },
};

export function EmptyState({ filter }: EmptyStateProps) {
  const { title, body } = COPY[filter];
  return (
    <div className="text-center px-4 py-14 text-text-muted">
      <div
        className="mx-auto mb-4 h-3.5 w-3.5 rounded-full border-2 border-dashed border-border-strong"
        aria-hidden="true"
      />
      <p className="font-display text-xl font-semibold text-text mb-2">
        {title}
      </p>
      <p className="text-sm leading-7">{body}</p>
    </div>
  );
}
