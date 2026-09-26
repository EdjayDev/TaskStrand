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
 * Passing complete adds a faint pulse ring behind the knot as a
 * one-time "case closed" beat instead of a constant idle animation.
 */
function StitchDivider({
  progress,
  complete,
}: {
  progress: number;
  complete: boolean;
}) {
  const clamped = Math.min(1, Math.max(0, progress));
  const knotX = 4 + clamped * (216 - 4);

  return (
    <svg
      viewBox="0 0 220 8"
      className="h-2 w-full max-w-[220px] overflow-visible"
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
      {complete && (
        <circle
          cx={knotX}
          cy="4"
          r="3.5"
          fill="none"
          stroke="var(--strand-bright)"
          strokeWidth="1"
          className="animate-ping-once"
        />
      )}
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
      className={`h-3.5 w-3.5 transition-transform duration-300 ${
        pinned ? "-rotate-45" : "rotate-0"
      }`}
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

/* Small rotated dossier stamp — reinforces the case-file motif and
 * gives the header a focal point beyond the counts row. Only appears
 * once there's something to report on. */
function CaseStamp({ allDone, total }: { allDone: boolean; total: number }) {
  if (total === 0) return null;
  return (
    <span
      className={`select-none rounded-[3px] border px-1.5 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-[0.14em] rotate-[-3deg] transition-colors duration-300 ${
        allDone
          ? "border-thread text-thread-hover bg-thread/10"
          : "border-border-strong text-text-faint"
      }`}
    >
      {allDone ? "Case Closed" : "Open Case"}
    </span>
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
  const percent = Math.round(progress * 100);

  return (
    <header className="mb-7">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <p className="font-mono text-[10px] font-medium uppercase tracking-[0.18em] text-text-faint m-0">
              Case board
            </p>
            <CaseStamp allDone={allDone} total={total} />
          </div>
          <h1 className="font-display text-3xl font-bold tracking-[-0.025em] text-text m-0">
            TaskStrand
          </h1>
        </div>

        {total > 0 && (
          <button
            className={`group flex items-center gap-1.5 rounded-[12px] border px-3 py-2 text-xs font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 focus-visible:ring-offset-card ${
              allDone
                ? "border-thread bg-thread/10 text-thread-hover shadow-[0_0_0_1px_var(--strand-core)_inset]"
                : "border-border text-text-muted hover:border-thread hover:text-thread-hover hover:-translate-y-px hover:shadow-sm"
            }`}
            onClick={onToggleAll}
          >
            <PinIcon pinned={allDone} />
            {allDone ? "Unpin all" : "Pin all done"}
          </button>
        )}
      </div>

      <div className="mt-3 mb-2.5 flex items-center gap-2.5">
        <StitchDivider progress={progress} complete={allDone && total > 0} />
        {total > 0 && (
          <span className="font-mono text-[10px] tabular-nums text-text-faint">
            {percent}%
          </span>
        )}
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
}

/*
 * Add once to your global stylesheet (not scoped to this file) —
 * a single non-repeating pulse for the "case closed" moment:
 *
 * @keyframes ping-once {
 *   0%   { transform: scale(1); opacity: 0.8; }
 *   100% { transform: scale(2.4); opacity: 0; }
 * }
 * .animate-ping-once { animation: ping-once 0.6s ease-out 1; }
 */
