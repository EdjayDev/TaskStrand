import styles from "./AppHeader.module.css";

interface AppHeaderProps {
  total: number;
  remaining: number;
  completed: number;
  allDone: boolean;
  onToggleAll: () => void;
}

export function AppHeader({ total, remaining, completed, allDone, onToggleAll }: AppHeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>TaskStrand</h1>
        <p className={styles.stats}>
          <span>
            <strong>{total}</strong> total
          </span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span>
            <strong>{remaining}</strong> pending
          </span>
          <span className={styles.dot} aria-hidden="true">
            ·
          </span>
          <span>
            <strong>{completed}</strong> done
          </span>
        </p>
      </div>

      {total > 0 && (
        <button className={styles.toggleAll} onClick={onToggleAll}>
          {allDone ? "Unpin all" : "Pin all done"}
        </button>
      )}
    </header>
  );
}
