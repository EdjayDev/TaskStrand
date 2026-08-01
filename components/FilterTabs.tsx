import type { Filter } from "../types";
import styles from "./FilterTabs.module.css";

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

export function FilterTabs({ filter, onChange, completedCount, onClearCompleted }: FilterTabsProps) {
  return (
    <div className={styles.panel}>
      <div className={styles.group} role="tablist" aria-label="Filter tasks">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={filter === key}
            className={`${styles.tab} ${filter === key ? styles.tabActive : ""}`}
            onClick={() => onChange(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {completedCount > 0 && (
        <button type="button" className={styles.clear} onClick={onClearCompleted}>
          Clear completed ({completedCount})
        </button>
      )}
    </div>
  );
}
