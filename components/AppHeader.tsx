interface AppHeaderProps {
  total: number;
  remaining: number;
  completed: number;
  allDone: boolean;
  onToggleAll: () => void;
}

/*
 * A dashed thread whose middle knot slides along the strand in
 * proportion to completion — the divider doubles as a progress
 * indicator instead of being purely decorative. At 0% the knot sits
 * at the start (paper), at 100% it reaches the end (bright).
 */
function StitchDivider({ progress }: { progress: number }) {
  const clamped = Math.min(1, Math.max(0, progress));
  const knotX = 4 + clamped * (216 - 4);

  return (
    <svg
      viewBox="0 0 220 8"
      className="h-2 w-full max-w-[220px]"
      aria-hidden="true"
    >
      <line
        x1="4"
        y1="4"
        x2="216"
        y2="4"
        stroke="var(--color-border-strong)"
        strokeWidth="1.5"
        strokeDasharray="5 5"
      />
      {/* completed portion drawn solid over the dashed base */}
      <line
        x1="4"
        y1="4"
        x2={knotX}
        y2="4"
        stroke="var(--strand-core)"
        strokeWidth="1.5"
        className="transition-[x2] duration-500 ease-out"
      />
      <circle cx="4" cy="4" r="3" fill="var(--strand-paper)" />
      <circle
        cx={knotX}
        cy="4"
        r="3.5"
        fill="var(--strand-bright)"
        className="transition-[cx] duration-500 ease-out"
      />
    </svg>
  );
}

function PinIcon({ pinned }: { pinned: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5v4.2M4.5 6.7h7l-1 3.6H5.5l-1-3.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
        opacity={pinned ? 0.5 : 1}
      />
      <path
        d="M8 10.3V14.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function AppHeader({
  total,
  remaining,
  completed,
  allDone,
  onToggleAll,
}: AppHeaderProps) {
  const progress = total > 0 ? completed / total : 0;

  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-faint m-0 mb-1">
            Case board
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-text m-0">
            TaskStrand
          </h1>
        </div>
        {total > 0 && (
          <button
            className={`flex items-center gap-1.5 rounded-[12px] border px-3 py-2 text-xs font-medium transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
              allDone
                ? "border-thread bg-thread/10 text-thread-hover"
                : "border-border text-text-muted hover:border-thread hover:text-thread-hover"
            }`}
            onClick={onToggleAll}
          >
            <PinIcon pinned={allDone} />
            {allDone ? "Unpin all" : "Pin all done"}
          </button>
        )}
      </div>

      <div className="mt-3 mb-2.5">
        <StitchDivider progress={progress} />
      </div>

      <p
        className="font-mono text-xs text-text-muted m-0 flex flex-wrap items-center gap-x-4 gap-y-1.5"
        aria-live="polite"
      >
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-paper)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {total}
          </strong>{" "}
          total
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-core)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {remaining}
          </strong>{" "}
          pending
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-bright)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {completed}
          </strong>{" "}
          done
        </span>
      </p>
    </header>
  );
}  allDone,
  onToggleAll,
}: AppHeaderProps) {
  return (
    <header className="mb-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-faint m-0 mb-1">
            Case board
          </p>
          <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-text m-0">
            TaskStrand
          </h1>
        </div>

        {total > 0 && (
          <button
            className="flex items-center gap-1.5 rounded-[12px] border border-border px-3 py-2 text-xs font-medium text-text-muted transition duration-200 hover:border-thread hover:text-thread-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 focus-visible:ring-offset-card"
            onClick={onToggleAll}
          >
            <PinIcon pinned={allDone} />
            {allDone ? "Unpin all" : "Pin all done"}
          </button>
        )}
      </div>

      <div className="mt-3 mb-2.5">
        <StitchDivider />
      </div>

      <p className="font-mono text-xs text-text-muted m-0 flex items-center gap-4">
        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-paper)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {total}
          </strong>{" "}
          total
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-core)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {remaining}
          </strong>{" "}
          pending
        </span>

        <span className="flex items-center gap-1.5">
          <span
            className="inline-block h-1.5 w-1.5 rounded-full bg-[var(--strand-bright)]"
            aria-hidden="true"
          />
          <strong className="text-text font-medium tabular-nums">
            {completed}
          </strong>{" "}
          done
        </span>
      </p>
    </header>
  );
}
