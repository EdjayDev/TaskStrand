interface RevealProps {
  index: number;
  setRevealRef: (index: number) => (el: HTMLDivElement | null) => void;
  revealClass: string;
}

interface FeatureCardProps extends RevealProps {
  label: string;
  title: string;
  description: string;
}

export function FeatureCard({
  label,
  title,
  description,
  index,
  setRevealRef,
  revealClass,
}: FeatureCardProps) {
  return (
    <article
      data-reveal-index={index}
      ref={setRevealRef(index)}
      className={`rounded-[24px] border border-border bg-canvas-alt/90 p-5 transition-all duration-700 ease-out ${revealClass}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
        {label}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
    </article>
  );
}

interface MockTaskCardProps {
  status: string;
  title: string;
  badge: string;
  done?: boolean;
  animationClass: string;
  delayClass?: string;
}

export function MockTaskCard({
  status,
  title,
  badge,
  done = false,
  animationClass,
  delayClass = "",
}: MockTaskCardProps) {
  return (
    <div
      className={`rounded-[28px] border ${done ? "border-thread-done/20" : "border-thread/20"} bg-canvas-alt/90 p-6 shadow-card floating-card ${animationClass} ${delayClass}`}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={`pin relative h-12 w-12 rounded-full border ${done ? "border-thread-done" : "border-thread"} ${done ? "bg-thread-done/10" : "bg-thread/10"}`}
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              {status}
            </p>
            <p className="mt-1 text-lg font-semibold text-text">{title}</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold ${done ? "bg-thread-done/10 text-thread-done" : "bg-thread/10 text-thread"}`}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

interface TaskListItemProps {
  title: string;
  badge: string;
  description: string;
  done?: boolean;
}

export function TaskListItem({
  title,
  badge,
  description,
  done = false,
}: TaskListItemProps) {
  return (
    <div
      className={`task-item flex gap-4 rounded-[28px] border ${done ? "border-thread-done" : "border-border"} bg-canvas-alt/90 p-5 transition hover:bg-white/5`}
    >
      <div
        className={`pin relative h-11 w-11 rounded-full border ${done ? "border-thread-done bg-thread-done/10" : "border-thread bg-thread/10"}`}
      />
      <div className="flex-1 space-y-2 task-content p-3">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text">{title}</p>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${done ? "bg-thread-done/10 text-thread-done" : "bg-thread/10 text-thread"}`}
          >
            {badge}
          </span>
        </div>
        <p className="text-sm text-text-faint">{description}</p>
      </div>
    </div>
  );
}

export function ThreadConnectorOverlay() {
  return (
    <div className="pointer-events-none absolute inset-y-0 left-[50%] hidden lg:block">
      <div className="absolute top-24 left-[calc(50%-0.5px)] h-[calc(100%-8rem)] w-px rounded-full bg-thread/30" />
      <div className="absolute top-24 left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
      <div className="absolute top-36 left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
      <div className="absolute top-48 left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
      <div className="absolute top-60 left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
      <div className="absolute top-72 left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
      <div className="absolute top-[calc(100%-5rem)] left-[calc(50%-0.5px)] h-1 w-1 rounded-full bg-thread/40" />
    </div>
  );
}
