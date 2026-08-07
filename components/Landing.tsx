import { useEffect, useRef, useState } from "react";
import {
  FeatureCard,
  MockTaskCard,
  TaskListItem,
  ThreadConnectorOverlay,
} from "./LandingHelpers";

interface LandingProps {
  onStart: () => void;
}

export function Landing({ onStart }: LandingProps) {
  const [isReady, setIsReady] = useState(false);
  const [revealed, setRevealed] = useState<Record<number, boolean>>({});
  const revealRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const timeout = window.setTimeout(() => setIsReady(true), 120);
    return () => window.clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = Number(entry.target.getAttribute("data-reveal-index"));
          if (entry.isIntersecting) {
            setRevealed((prev) =>
              prev[index] ? prev : { ...prev, [index]: true },
            );
          }
        });
      },
      { threshold: 0.25 },
    );

    revealRefs.current.forEach((element) => {
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  const setRevealRef = (index: number) => (el: HTMLDivElement | null) => {
    revealRefs.current[index] = el;
  };

  const revealClass = (index: number) =>
    revealed[index] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10";

  return (
    <div className="relative min-h-screen overflow-hidden bg-canvas text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(51,153,137,0.18),transparent_28%),radial-gradient(circle_at_85%_80%,rgba(125,226,209,0.12),transparent_45%)]" />

      <header className="sticky top-0 z-20 border-b border-border/50 bg-canvas/95 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-4 text-center">
          <p className="font-display uppercase tracking-[0.06em] text-5xl font-extrabold leading-none text-text sm:text-7xl lg:text-8xl">
            TASK STRAND
          </p>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-14">
        <section className="grid gap-16 lg:grid-cols-[minmax(320px,44%)_minmax(420px,56%)] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.3em] text-thread-done">
              multiple tasks connected
            </p>
            <h1 className="font-display text-5xl font-bold tracking-[-0.04em] leading-tight text-text">
              A live thread of tasks that move and connect together.
            </h1>
            <p className="max-w-xl text-base leading-8 text-text-muted">
              Your workflow becomes a visual thread — floating cards, dashed
              task nodes, and connected task relationships that come alive as
              you scroll.
            </p>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-[16px] bg-thread px-8 py-4 text-sm font-semibold text-canvas transition duration-200 hover:bg-thread-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
              onClick={onStart}
            >
              Start your thread <span aria-hidden="true">→</span>
            </button>
          </div>

          <div
            className={`relative overflow-hidden shape-panel border border-border bg-card p-8 shadow-card transition-all duration-700 ${
              isReady ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="absolute left-8 top-10 h-px w-32 bg-thread/40" />
            <div className="absolute right-10 top-24 h-px w-24 bg-thread-done/40" />
            <div className="absolute left-1/2 top-2/3 h-px w-40 -translate-x-1/2 bg-thread/30" />

            <div className="grid gap-6">
              <div className="relative shape-slab border border-dashed border-thread/30 bg-canvas-alt p-6">
                <span className="absolute -left-5 top-8 h-0.5 w-10 bg-thread/40" />
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                  run multiple task
                </p>
                <h2 className="mt-3 text-xl font-semibold text-text">
                  Track work in grouped cards
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Each card represents a subtask with live status and flavor
                  text beside it.
                </p>
              </div>

              <div className="relative shape-slab border border-dashed border-thread-done/30 bg-canvas-alt p-6">
                <span className="absolute -right-5 top-10 h-0.5 w-12 bg-thread-done/40" />
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                  control the thread
                </p>
                <h2 className="mt-3 text-xl font-semibold text-text">
                  Connect tasks with thread links
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Task cards are visually linked so you can see dependencies,
                  progress, and flow.
                </p>
              </div>

              <div className="relative shape-slab border border-dashed border-thread/30 bg-canvas-alt p-6">
                <span className="absolute left-0 top-[-10px] h-0.5 w-14 bg-thread/40" />
                <p className="text-xs uppercase tracking-[0.3em] text-text-muted">
                  stay focused
                </p>
                <h2 className="mt-3 text-xl font-semibold text-text">
                  Every card feels alive
                </h2>
                <p className="mt-2 text-sm leading-6 text-text-muted">
                  Flavor text beside each card makes the thread narrative feel
                  alive.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="shape-panel-alt border border-border bg-card p-8 shadow-card">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-thread-done">
                  more as you scroll
                </p>
                <h2 className="mt-3 text-3xl font-semibold text-text">
                  Features that unfold from the thread.
                </h2>
              </div>
              <button className="inline-flex items-center rounded-full border border-thread px-5 py-3 text-sm font-semibold text-thread transition hover:bg-thread/10">
                Explore features
              </button>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <FeatureCard
                index={0}
                setRevealRef={setRevealRef}
                revealClass={revealClass(0)}
                label="organize"
                title="Pinned task flow"
                description="Keep every task pinned inside the same thread so nothing slips through the cracks."
              />
              <FeatureCard
                index={1}
                setRevealRef={setRevealRef}
                revealClass={revealClass(1)}
                label="visualize"
                title="Connected status"
                description="See which tasks are active, done, or waiting at a glance with strong thread visuals."
              />
              <FeatureCard
                index={2}
                setRevealRef={setRevealRef}
                revealClass={revealClass(2)}
                label="prioritize"
                title="Live card details"
                description="Each card shows a short flavor note so you know exactly what action it represents."
              />
            </div>
          </div>
        </section>

        <section className="mt-16 space-y-8">
          <div className="relative grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <ThreadConnectorOverlay />

            <div
              data-reveal-index={3}
              ref={setRevealRef(3)}
              className={`shape-panel-alt border border-border bg-card p-8 shadow-card transition-all duration-700 ease-out ${revealClass(3)}`}
            >
              <p className="text-sm uppercase tracking-[0.3em] text-thread-done">
                coming alive
              </p>
              <h2 className="mt-4 text-3xl font-semibold text-text">
                Task flows with motion.
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-text-muted">
                Preview how task cards float, pulse, and link together inside a
                scrolling workflow. Each item feels light and layered with a
                soft animated rhythm.
              </p>

              <div className="mt-8 space-y-4">
                <MockTaskCard
                  status="in progress"
                  title="Publish the task thread layout"
                  badge="3 / 5"
                  animationClass="animate-float"
                />
                <MockTaskCard
                  status="done"
                  title="Sync the thread state across cards"
                  badge="done"
                  done
                  animationClass="animate-float-reverse"
                  delayClass="delay-1500"
                />
              </div>
            </div>

            <div
              data-reveal-index={4}
              ref={setRevealRef(4)}
              className={`relative overflow-hidden shape-panel border border-border bg-card p-8 shadow-card transition-all duration-700 ease-out ${revealClass(4)}`}
            >
              <div className="absolute inset-x-0 top-8 flex justify-center">
                <span className="h-px w-24 rounded-full bg-thread/20" />
              </div>
              <div className="grid gap-4 pt-12">
                <TaskListItem
                  title="Design hero motion"
                  badge="high"
                  description="Smooth entrance, subtle float, and connected thread lines."
                />
                <TaskListItem
                  title="Animate card status"
                  badge="done"
                  description="Motion gives the task grid a more alive, tactile feel."
                  done
                />
                <TaskListItem
                  title="Keep the thread alive"
                  badge="next"
                  description="A small card preview shows how tasks flow from start to done."
                />
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
