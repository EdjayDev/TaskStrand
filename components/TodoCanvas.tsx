"use client";

import { useEffect, useRef, useState } from "react";
import type { Filter, Todo, TodoColor, TodoPosition, TodoSize } from "../types";
import { TodoCard } from "./TodoCard";
import { EmptyState } from "./EmptyState";

interface TodoCanvasProps {
  todos: Todo[];
  filter: Filter;
  onCreate: (todo: Todo) => void;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: TodoPosition) => void;
  onResize: (id: string, size: TodoSize) => void;
}

const CANVAS_WIDTH = 3200;
const CANVAS_HEIGHT = 2000;
const GRID_SIZE = 40;

// Must match GRID_SIZE / MIN_WIDTH / MIN_HEIGHT in TodoCard.tsx —
// both files snap to the same 40px grid, and both enforce the same
// grid-aligned floor (5 cells wide, 3 cells tall).
const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

// Every card cycles through tones of the same thread material,
// not arbitrary red/green/blue primaries. Keep in sync with
// TodoColor in types.ts.
const COLOR_CYCLE: TodoColor[] = ["dark", "core", "bright", "paper"];

// Shared styling for the naming-panel form controls (title input,
// steps textarea) so both fields stay visually consistent without
// repeating the same class string.
const PANEL_FIELD_CLASS =
  "w-full border border-[#151614] bg-[#151614] px-1 py-0.5 text-white outline-none " +
  "transition-colors focus:border-[var(--strand-bright)]";

// Create is the primary action (filled, bright accent); Cancel is
// secondary (outline only) — the color difference is the affordance,
// not just decoration, so a person can tell the two apart at a glance.
const PANEL_BUTTON_BASE_CLASS =
  "rounded px-1.5 py-0.5 text-[9px] font-medium transition-all duration-100 " +
  "active:scale-95";
const PANEL_BUTTON_PRIMARY_CLASS = `${PANEL_BUTTON_BASE_CLASS} border border-[var(--strand-bright)] bg-[var(--strand-bright)] text-[#151614] hover:brightness-110`;
const PANEL_BUTTON_SECONDARY_CLASS = `${PANEL_BUTTON_BASE_CLASS} border border-[#151614] bg-transparent text-white/70 hover:border-white/40 hover:text-white`;

// One-time keyframes for the two micro-interactions below: the naming
// panel popping into place, and the sizing start-point pulsing to
// confirm the click registered. Scoped by class name, not element, so
// they're harmless to repeat if the canvas re-mounts.
const CANVAS_MOTION_STYLES = `
  @keyframes todocanvas-panel-in {
    from { opacity: 0; transform: scale(0.96) translateY(2px); }
    to { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes todocanvas-pulse {
    0% { transform: translate(-50%, -50%) scale(1); opacity: 0.9; }
    70% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
    100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
  }
`;

/** Draft-creation state machine:
 *  - "idle":   nothing happening.
 *  - "sizing": start point placed; the box previews live as the
 *              pointer moves, until a second click lands the end point.
 *  - "naming": box is fixed in place; the title/steps panel is open.
 */
type DraftStage = "idle" | "sizing" | "naming";

interface DraftBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

/** Builds a grid-snapped box from two opposite corners, enforcing the
 * minimum width/height floor so a near-zero drag still yields a usable card. */
function boxFromPoints(start: Point, end: Point): DraftBox {
  const x = Math.min(start.x, end.x);
  const y = Math.min(start.y, end.y);
  const width = Math.max(Math.abs(end.x - start.x), MIN_WIDTH);
  const height = Math.max(Math.abs(end.y - start.y), MIN_HEIGHT);
  return { x, y, width, height };
}

export function TodoCanvas({
  todos,
  filter,
  onCreate,
  onToggle,
  onDelete,
  onMove,
  onResize,
}: TodoCanvasProps) {
  // canvasRef: the outer scrollable viewport. Used ONLY for scroll
  // offset and bounding-rect math — this is the element that scrolls.
  const canvasRef = useRef<HTMLDivElement | null>(null);
  // contentRef: the full-size inner surface a click on empty grid
  // space actually lands on. Handlers and the target check both live
  // here — attaching them to canvasRef and checking against
  // canvasRef.current was the bug: that check is never true, because
  // the DOM element under the pointer is this inner div, not the
  // outer scroll container, so every click was silently ignored.
  const contentRef = useRef<HTMLDivElement | null>(null);
  const startPoint = useRef<Point | null>(null);

  const [stage, setStage] = useState<DraftStage>("idle");
  const [draftBox, setDraftBox] = useState<DraftBox | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSteps, setDraftSteps] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  // Grid cell the pointer is currently over while idle. Purely visual —
  // it's what invites a first-time user to click at all, since an empty
  // grid gives no other signal that it's drawable.
  const [hoverCell, setHoverCell] = useState<Point | null>(null);

  /** Converts a pointer event's viewport coordinates into grid-snapped
   * canvas-content coordinates, accounting for scroll offset. */
  const pointFromEvent = (event: {
    clientX: number;
    clientY: number;
  }): Point | null => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: snapToGrid(event.clientX - rect.left + canvasRef.current.scrollLeft),
      y: snapToGrid(event.clientY - rect.top + canvasRef.current.scrollTop),
    };
  };

  /*
   * First click on empty canvas drops the start point and enters
   * sizing mode. Second click drops the end point, fixes the box,
   * and opens the naming panel. Clicks on anything other than the
   * bare grid surface (a card, the naming panel) are ignored because
   * their target won't be contentRef itself.
   */
  const handleCanvasClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target !== contentRef.current) return;

    const point = pointFromEvent(event);
    if (!point) return;

    if (stage === "idle") {
      startPoint.current = point;
      setDraftBox({ x: point.x, y: point.y, width: 0, height: 0 });
      setStage("sizing");
      return;
    }

    if (stage === "sizing" && startPoint.current) {
      setDraftBox(boxFromPoints(startPoint.current, point));
      setStage("naming");
      requestAnimationFrame(() => titleInputRef.current?.focus());
    }
  };

  /*
   * While sizing, the box follows the pointer live so the person can
   * see exactly what they're about to place before the second click.
   * While idle, the same handler tracks hoverCell so the grid can
   * show a "you can draw here" highlight under the cursor.
   */
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const point = pointFromEvent(event);
    if (!point) return;

    if (stage === "sizing" && startPoint.current) {
      setDraftBox(boxFromPoints(startPoint.current, point));
      return;
    }

    if (stage === "idle") {
      setHoverCell(point);
    }
  };

  const handleCanvasMouseLeave = () => setHoverCell(null);

  // Escape backs out of sizing or naming at any point.
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && stage !== "idle") {
        resetDraft();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [stage]);

  /** Turns the current draft box + form fields into a real Todo, then
   * clears the draft. A blank title cancels instead of creating a card. */
  const commitDraft = () => {
    const title = draftTitle.trim();
    if (!draftBox || title.length === 0) {
      resetDraft();
      return;
    }

    const steps = draftSteps
      .split("\n")
      .map((step) => step.trim())
      .filter((step) => step.length > 0);

    onCreate({
      id: crypto.randomUUID(),
      text: title,
      completed: false,
      subtasks: steps,
      color: COLOR_CYCLE[todos.length % COLOR_CYCLE.length],
      position: { x: draftBox.x, y: draftBox.y },
      size: { width: draftBox.width, height: draftBox.height },
    });

    resetDraft();
  };

  /** Clears all in-progress draft state and returns to "idle". */
  const resetDraft = () => {
    startPoint.current = null;
    setStage("idle");
    setDraftBox(null);
    setDraftTitle("");
    setDraftSteps("");
  };

  const isIdle = stage === "idle";
  const isSizing = stage === "sizing";
  const isNaming = stage === "naming";
  const showEmptyState = todos.length === 0 && isIdle;
  const showHoverHint = isIdle && hoverCell !== null;

  return (
    <div
      ref={canvasRef}
      className="relative h-screen w-full overflow-auto bg-[var(--color-void)]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        cursor: isSizing ? "crosshair" : "default",
      }}
    >
      <style>{CANVAS_MOTION_STYLES}</style>

      <div
        ref={contentRef}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: "relative",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={handleCanvasMouseLeave}
      >
        {/* Idle hover hint: a soft grid-cell outline + "+" that follows
            the cursor, so an empty canvas still signals "click here to
            start a thread" instead of looking inert. */}
        {showHoverHint && hoverCell && (
          <div
            className="pointer-events-none absolute flex items-center justify-center rounded-sm border border-dashed border-white/25 text-white/30 transition-opacity"
            style={{
              left: hoverCell.x,
              top: hoverCell.y,
              width: GRID_SIZE,
              height: GRID_SIZE,
            }}
          >
            <span className="text-[13px] leading-none">+</span>
          </div>
        )}

        {showEmptyState && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <EmptyState filter={filter} />
          </div>
        )}

        {todos.map((todo) => (
          <TodoCard
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onDelete={onDelete}
            onMove={onMove}
            onResize={onResize}
          />
        ))}

        {/* Start point marker + live preview box while sizing */}
        {draftBox && isSizing && (
          <>
            <div
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--strand-bright)]"
              style={{
                left: startPoint.current?.x ?? draftBox.x,
                top: startPoint.current?.y ?? draftBox.y,
              }}
            >
              {/* Pulsing ring confirms the first click registered —
                  otherwise the start point is a static dot easy to miss. */}
              <div
                className="absolute left-1/2 top-1/2 h-2.5 w-2.5 rounded-full bg-[var(--strand-bright)]"
                style={{ animation: "todocanvas-pulse 1.1s ease-out infinite" }}
              />
            </div>

            <div
              className="pointer-events-none absolute border-2 border-dashed border-[var(--color-thread)] bg-[var(--color-thread)]/15"
              style={{
                left: draftBox.x,
                top: draftBox.y,
                width: draftBox.width,
                height: draftBox.height,
              }}
            />

            {/* Live dimension readout in grid cells, so the person can
                aim for a specific size instead of guessing pixels. */}
            <div
              className="pointer-events-none absolute rounded bg-[var(--color-thread)] px-1.5 py-0.5 text-[9px] font-medium text-white"
              style={{
                left: draftBox.x + draftBox.width + 6,
                top: draftBox.y + draftBox.height + 6,
              }}
            >
              {Math.round(draftBox.width / GRID_SIZE)} ×{" "}
              {Math.round(draftBox.height / GRID_SIZE)}
            </div>
          </>
        )}

        {/* Naming panel, anchored at the finished box */}
        {draftBox && isNaming && (
          <div
            className="absolute z-10 flex flex-col gap-1 border-2 border-thread bg-thread p-2 shadow-lg"
            style={{
              left: draftBox.x,
              top: draftBox.y,
              width: Math.max(draftBox.width, MIN_WIDTH),
              transformOrigin: "top left",
              animation: "todocanvas-panel-in 150ms ease-out",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={titleInputRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Task title"
              className={`${PANEL_FIELD_CLASS} text-[11px]`}
              onKeyDown={(event) => {
                if (event.key === "Enter") commitDraft();
                if (event.key === "Escape") resetDraft();
              }}
            />

            <textarea
              value={draftSteps}
              onChange={(event) => setDraftSteps(event.target.value)}
              placeholder="One step per line (optional)"
              rows={3}
              className={`${PANEL_FIELD_CLASS} resize-none text-[10px]`}
            />

            <div className="flex items-center justify-between gap-2">
              {/* Keyboard hint keeps the shortcuts discoverable without
                  cluttering the primary action row. */}
              <span className="text-[8px] uppercase tracking-wide text-white/35">
                Enter ↵ create · Esc cancel
              </span>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={resetDraft}
                  className={PANEL_BUTTON_SECONDARY_CLASS}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={commitDraft}
                  disabled={draftTitle.trim().length === 0}
                  className={`${PANEL_BUTTON_PRIMARY_CLASS} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100`}
                >
                  Create
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
