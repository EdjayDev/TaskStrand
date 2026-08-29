import React, { ComponentPropsWithoutRef, ReactNode } from "react";

// Helper utility for conditional classes (cleaner than template literals)
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

/* -------------------------------------------------------------------------- */
/*                                FeatureCard                                 */
/* -------------------------------------------------------------------------- */

export interface RevealProps {
  index: number;
  setRevealRef: (index: number) => (el: HTMLDivElement | null) => void;
  revealClass: string;
}

export interface FeatureCardProps
  extends RevealProps,
    Omit<ComponentPropsWithoutRef<"article">, "title"> {
  label: ReactNode;
  title: ReactNode;
  description: ReactNode;
}

export function FeatureCard({
  label,
  title,
  description,
  index,
  setRevealRef,
  revealClass,
  className = "",
  ...props
}: FeatureCardProps) {
  return (
    <article
      data-reveal-index={index}
      ref={setRevealRef(index)}
      className={cn(
        "shape-slab border border-border bg-canvas-alt p-5 transition-all duration-700 ease-out",
        revealClass,
        className
      )}
      {...props}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
        {label}
      </p>
      <h3 className="mt-3 text-lg font-semibold text-text">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-text-muted">{description}</p>
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*                                MockTaskCard                                */
/* -------------------------------------------------------------------------- */

export interface MockTaskCardProps extends ComponentPropsWithoutRef<"div"> {
  status: ReactNode;
  title: ReactNode;
  badge: ReactNode;
  done?: boolean;
  animationClass?: string;
  delayClass?: string;
}

export function MockTaskCard({
  status,
  title,
  badge,
  done = false,
  animationClass = "",
  delayClass = "",
  className = "",
  ...props
}: MockTaskCardProps) {
  return (
    <div
      className={cn(
        "shape-slab-alt floating-card border bg-canvas-alt p-6 shadow-card",
        done ? "border-thread-done/20" : "border-thread/20",
        animationClass,
        delayClass,
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div
            className={cn(
              "relative h-12 w-12 rounded-full border",
              done
                ? "border-thread-done bg-thread-done/10"
                : "border-thread bg-thread/10"
            )}
          />
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
              {status}
            </p>
            <p className="mt-1 text-lg font-semibold text-text">{title}</p>
          </div>
        </div>
        <span
          className={cn(
            "rounded-full px-3 py-1 text-xs font-semibold",
            done
              ? "bg-thread-done/10 text-thread-done"
              : "bg-thread/10 text-thread"
          )}
        >
          {badge}
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                TaskListItem                                */
/* -------------------------------------------------------------------------- */

export interface TaskListItemProps extends ComponentPropsWithoutRef<"div"> {
  title: ReactNode;
  badge: ReactNode;
  description: ReactNode;
  done?: boolean;
}

export function TaskListItem({
  title,
  badge,
  description,
  done = false,
  className = "",
  ...props
}: TaskListItemProps) {
  return (
    <div
      className={cn(
        "shape-slab group flex gap-4 border bg-canvas-alt p-5 transition hover:bg-white/5",
        done ? "border-thread-done" : "border-border",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "relative h-11 w-11 rounded-full border",
          done
            ? "border-thread-done bg-thread-done/10"
            : "border-thread bg-thread/10"
        )}
      />
      <div
        className={cn(
          "flex-1 space-y-2 rounded-r-xl border-l-2 border-dashed p-3 transition-colors",
          done
            ? "border-thread-done bg-white/[0.02]"
            : "border-border-strong group-hover:border-thread group-hover:bg-white/[0.03]"
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-text">{title}</p>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-semibold",
              done
                ? "bg-thread-done/10 text-thread-done"
                : "bg-thread/10 text-thread"
            )}
          >
            {badge}
          </span>
        </div>
        <p className="text-sm text-text-faint">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           ThreadConnectorOverlay                           */
/* -------------------------------------------------------------------------- */

export function ThreadConnectorOverlay({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  const nodePositions = [
    "top-24",
    "top-36",
    "top-48",
    "top-60",
    "top-72",
    "top-[calc(100%-5rem)]",
  ];

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-y-0 left-1/2 hidden lg:block",
        className
      )}
      {...props}
    >
      <div className="absolute top-24 left-[-0.5px] h-[calc(100%-8rem)] w-px rounded-full bg-thread/30" />
      {nodePositions.map((pos) => (
        <div
          key={pos}
          className={cn(
            "absolute left-[-0.5px] h-1 w-1 rounded-full bg-thread/40",
            pos
          )}
        />
      ))}
    </div>
  );
}
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
