"use client";

import { useRef, useState } from "react";
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

const CANVAS_WIDTH = 2400;
const CANVAS_HEIGHT = 1400;
const DEFAULT_SIZE: TodoSize = { width: 220, height: 130 };
const COLOR_CYCLE: TodoColor[] = ["green", "blue", "orange", "thread"];

interface DraftBox {
  x: number;
  y: number;
  width: number;
  height: number;
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
  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const [draftBox, setDraftBox] = useState<DraftBox | null>(null);
  const [isNaming, setIsNaming] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftSteps, setDraftSteps] = useState("");
  const titleInputRef = useRef<HTMLInputElement | null>(null);

  /*
   * Dragging on empty canvas space (not on a card) marks out where a
   * new task should be created — the same "create directly on the
   * surface" gesture as before, just on the shared canvas now.
   */
  const handleCanvasPointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (event.target !== canvasRef.current || isNaming) return;
    if (event.button !== 0) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = event.clientY - rect.top + canvasRef.current.scrollTop;

    dragStart.current = { x, y };
    setDraftBox({ x, y, width: 0, height: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleCanvasPointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!dragStart.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left + canvasRef.current.scrollLeft;
    const y = event.clientY - rect.top + canvasRef.current.scrollTop;

    setDraftBox({
      x: Math.min(dragStart.current.x, x),
      y: Math.min(dragStart.current.y, y),
      width: Math.abs(x - dragStart.current.x),
      height: Math.abs(y - dragStart.current.y),
    });
  };

  const handleCanvasPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragStart.current) return;

    dragStart.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }

    if (draftBox && draftBox.width > 20 && draftBox.height > 20) {
      setIsNaming(true);
      requestAnimationFrame(() => titleInputRef.current?.focus());
    } else {
      setDraftBox(null);
    }
  };

  const commitDraft = () => {
    const title = draftTitle.trim();
    if (!draftBox || title.length === 0) {
      cancelDraft();
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
      size: {
        width: Math.max(draftBox.width, DEFAULT_SIZE.width),
        height: Math.max(draftBox.height, DEFAULT_SIZE.height),
      },
    });

    resetDraft();
  };

  const cancelDraft = () => resetDraft();

  const resetDraft = () => {
    setDraftBox(null);
    setIsNaming(false);
    setDraftTitle("");
    setDraftSteps("");
  };

  return (
    <div
      ref={canvasRef}
      className="relative overflow-auto rounded-lg border border-border-strong bg-[#151614]"
      style={{
        width: "100%",
        height: "70vh",
      }}
      onPointerDown={handleCanvasPointerDown}
      onPointerMove={handleCanvasPointerMove}
      onPointerUp={handleCanvasPointerUp}
      onPointerCancel={() => {
        dragStart.current = null;
      }}
    >
      <div
        style={{
          width: CANVAS_WIDTH,
          height: CANVAS_HEIGHT,
          position: "relative",
        }}
      >
        {/* Empty state overlays the canvas rather than replacing it —
            the canvas is now how tasks get created, so the surface
            has to stay interactive (drag-to-create) even when it's
            empty. pointer-events-none lets drags pass straight
            through to the canvas underneath. */}
        {todos.length === 0 && (
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

        {/* In-progress drag rectangle, before naming */}
        {draftBox && !isNaming && (
          <div
            className="pointer-events-none absolute border-2 border-dashed border-thread bg-thread"
            style={{
              left: draftBox.x,
              top: draftBox.y,
              width: draftBox.width,
              height: draftBox.height,
            }}
          />
        )}

        {/* Naming panel, anchored at the drawn rectangle */}
        {draftBox && isNaming && (
          <div
            className="absolute z-10 flex flex-col gap-1 border-2 border-thread bg-thread p-2"
            style={{
              left: draftBox.x,
              top: draftBox.y,
              width: Math.max(draftBox.width, DEFAULT_SIZE.width),
            }}
          >
            <input
              ref={titleInputRef}
              value={draftTitle}
              onChange={(event) => setDraftTitle(event.target.value)}
              placeholder="Task title"
              className="w-full border border-[#151614] bg-[#151614] px-1 py-0.5 text-[11px] text-white outline-none"
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
                onClick={cancelDraft}
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
