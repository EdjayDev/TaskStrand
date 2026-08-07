interface AppHeaderProps {
  total: number;
  remaining: number;
  completed: number;
  allDone: boolean;
  onToggleAll: () => void;
}

export function AppHeader({
  total,
  remaining,
  completed,
  allDone,
  onToggleAll,
}: AppHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-3 mb-7">
      <div>
        <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-text m-0 mb-1">
          TaskStrand
        </h1>
        <p className="font-mono text-xs text-text-muted m-0">
          <span>
            <strong className="text-text font-medium">{total}</strong> total
          </span>
          <span className="mx-2 text-border-strong" aria-hidden="true">
            ·
          </span>
          <span>
            <strong className="text-text font-medium">{remaining}</strong>{" "}
            pending
          </span>
          <span className="mx-2 text-border-strong" aria-hidden="true">
            ·
          </span>
          <span>
            <strong className="text-text font-medium">{completed}</strong> done
          </span>
        </p>
      </div>

      {total > 0 && (
        <button
          className="rounded-[12px] border border-border px-3 py-2 text-xs font-medium text-text-muted transition duration-200 hover:border-text-muted hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
          onClick={onToggleAll}
        >
          {allDone ? "Unpin all" : "Pin all done"}
        </button>
      )}
    </header>
  );
}
