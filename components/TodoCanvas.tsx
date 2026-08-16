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

  // "idle": nothing happening. "sizing": start point placed, tracking
  // the pointer to preview the box until the second click lands the
  // end point. "naming": box is fixed, title/steps panel is open.
  const [stage, setStage] = useState<"idle" | "sizing" | "naming">("idle");
  const [draftBox, setDraftBox] = useState<DraftBox | null>(null);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSteps, setDraftSteps] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

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
   */
  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (stage !== "sizing" || !startPoint.current) return;
    const point = pointFromEvent(event);
    if (!point) return;
    setDraftBox(boxFromPoints(startPoint.current, point));
  };

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

  const resetDraft = () => {
    startPoint.current = null;
    setStage("idle");
    setDraftBox(null);
    setDraftTitle("");
    setDraftSteps("");
  };

  return (
    <div
      ref={canvasRef}
      className="relative h-screen w-full overflow-auto bg-[var(--color-void)]"
      style={{
        backgroundImage:
          "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
        cursor: stage === "sizing" ? "crosshair" : "default",
      }}
    >
      <div
        ref={contentRef}
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: "relative",
        }}
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
      >
        {todos.length === 0 && stage === "idle" && (
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
        {draftBox && stage === "sizing" && (
          <>
            <div
              className="pointer-events-none absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[var(--strand-bright)]"
              style={{
                left: startPoint.current?.x ?? draftBox.x,
                top: startPoint.current?.y ?? draftBox.y,
              }}
            />
            <div
              className="pointer-events-none absolute border-2 border-dashed border-[var(--color-thread)] bg-[var(--color-thread)]/15"
              style={{
                left: draftBox.x,
                top: draftBox.y,
                width: draftBox.width,
                height: draftBox.height,
              }}
            />
          </>
        )}

        {/* Naming panel, anchored at the finished box */}
        {draftBox && stage === "naming" && (
          <div
            className="absolute z-10 flex flex-col gap-1 border-2 border-thread bg-thread p-2"
            style={{
              left: draftBox.x,
              top: draftBox.y,
              width: Math.max(draftBox.width, MIN_WIDTH),
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={titleInputRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Task title"
              className="w-full border border-[#151614] bg-[#151614] px-1 py-0.5 text-[11px] text-white outline-none"
              onKeyDown={(event) => {
                if (event.key === "Enter") commitDraft();
                if (event.key === "Escape") resetDraft();
              }}
            />

            <textarea
              value={draftSteps}
              onChange={(event) => setDraftSteps(event.target.value)}
              placeholder={"One step per line (optional)"}
              rows={3}
              className="w-full resize-none border border-[#151614] bg-[#151614] px-1 py-0.5 text-[10px] text-white outline-none"
            />

            <div className="flex items-center gap-1 self-end">
              <button
                type="button"
                onClick={commitDraft}
                className="rounded border border-[#151614] bg-[#151614] px-1.5 py-0.5 text-[9px] text-white"
              >
                Create
              </button>

              <button
                type="button"
                onClick={resetDraft}
                className="rounded border border-[#151614] bg-[#151614] px-1.5 py-0.5 text-[9px] text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
