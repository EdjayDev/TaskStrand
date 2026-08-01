import styles from "./TodoThread.module.css";
import type { Filter } from "../types";

interface EmptyStateProps {
  filter: Filter;
}

const COPY: Record<Filter, { title: string; body: string }> = {
  all: { title: "No threads pinned yet", body: "Add your first task above to start the strand." },
  active: { title: "Nothing left pending", body: "Every pinned task is done, or the strand is empty." },
  completed: {
    title: "No completed tasks yet",
    body: "Finished tasks will pin here as you check them off.",
  },
};

export function EmptyState({ filter }: EmptyStateProps) {
  const { title, body } = COPY[filter];
  return (
    <div className={styles.empty}>
      <div className={styles.emptyKnot} aria-hidden="true" />
      <p className={styles.emptyTitle}>{title}</p>
      <p className={styles.emptyBody}>{body}</p>
    </div>
  );
}
