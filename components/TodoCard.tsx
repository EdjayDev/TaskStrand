"use client";

import { useRef } from "react";
import type { Todo, TodoColor, TodoPosition, TodoSize } from "../types";

interface TodoCardProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onMove: (id: string, position: TodoPosition) => void;
  onResize: (id: string, size: TodoSize) => void;
}

// Must match GRID_SIZE / MIN_WIDTH / MIN_HEIGHT in TodoCanvas.tsx —
// both files snap to the same 40px grid, and both enforce the same
// grid-aligned floor (5 cells wide, 3 cells tall) so a card can never
// end up off-grid or smaller than the grid itself allows.
const GRID_SIZE = 40;
const MIN_WIDTH = 200;
const MIN_HEIGHT = 120;

const snapToGrid = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

// Solid fills only — every card is a tone cut from the same spool as
// the header's stat knots (dark / core / bright / paper), not
// arbitrary red/green/blue primaries.
const CARD_FILL: Record<TodoColor, string> = {
  dark: "bg-[var(--strand-dark)]",
  core: "bg-[var(--strand-core)]",
  bright: "bg-[var(--strand-bright)]",
  paper: "bg-[var(--strand-paper)]",
};

// bright and paper are light fills — they need dark (void) text.
// dark and core are dark enough to stay on paper-colored text.
const CARD_TEXT: Record<TodoColor, string> = {
  dark: "text-[var(--strand-paper)]",
  core: "text-[var(--strand-paper)]",
  bright: "text-[var(--color-void)]",
  paper: "text-[var(--color-void)]",
};

const CARD_CONTROL: Record<TodoColor, string> = {
  dark: "border-[var(--strand-paper)]/30 text-[var(--strand-paper)] hover:bg-[var(--strand-paper)]/15",
  core: "border-[var(--strand-paper)]/30 text-[var(--strand-paper)] hover:bg-[var(--strand-paper)]/15",
  bright:
    "border-[var(--color-void)]/25 text-[var(--color-void)] hover:bg-[var(--color-void)]/10",
  paper:
    "border-[var(--color-void)]/25 text-[var(--color-void)] hover:bg-[var(--color-void)]/10",
};

function PinTack({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 1.5v4.2M4.5 6.7h7l-1 3.6H5.5l-1-3.6Z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
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

export function TodoCard({
  todo,
  onToggle,
  onDelete,
  onMove,
  onResize,
}: TodoCardProps) {
  const dragOrigin = useRef<{
    pointerX: number;
    pointerY: number;
    cardX: number;
    cardY: number;
  } | null>(null);

  const resizeOrigin = useRef<{
    pointerX: number;
    pointerY: number;
    width: number;
    height: number;
  } | null>(null);

  /*
   * Move the whole card. Ignored when the pointer came down on a
   * control (button) or the resize handle. Position snaps to the
   * same 40px grid the canvas draws, so a dragged card always lands
   * back on a grid line instead of anywhere in between.
   */
  const handleDragPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      cardX: todo.position.x,
      cardY: todo.position.y,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!dragOrigin.current) return;

    const deltaX = event.clientX - dragOrigin.current.pointerX;
    const deltaY = event.clientY - dragOrigin.current.pointerY;

    onMove(todo.id, {
      x: Math.max(0, snapToGrid(dragOrigin.current.cardX + deltaX)),
      y: Math.max(0, snapToGrid(dragOrigin.current.cardY + deltaY)),
    });
  };

  const endDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragOrigin.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  /*
   * Resize from the bottom-right handle, independent of the drag
   * handlers above so the two gestures never fight each other.
   * Width/height snap to the grid too, so a card's edges always land
   * on grid lines rather than an arbitrary pixel count.
   */
  const handleResizePointerDown = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    event.stopPropagation();
    if (event.button !== 0) return;

    resizeOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      width: todo.size.width,
      height: todo.size.height,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResizePointerMove = (
    event: React.PointerEvent<HTMLDivElement>,
  ) => {
    if (!resizeOrigin.current) return;

    const deltaX = event.clientX - resizeOrigin.current.pointerX;
    const deltaY = event.clientY - resizeOrigin.current.pointerY;

    onResize(todo.id, {
      width: Math.max(
        MIN_WIDTH,
        snapToGrid(resizeOrigin.current.width + deltaX),
      ),
      height: Math.max(
        MIN_HEIGHT,
        snapToGrid(resizeOrigin.current.height + deltaY),
      ),
    });
  };

  const endResize = (event: React.PointerEvent<HTMLDivElement>) => {
    event.stopPropagation();
    resizeOrigin.current = null;
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  const fill = CARD_FILL[todo.color];
  const text = CARD_TEXT[todo.color];
  const control = CARD_CONTROL[todo.color];

  return (
    <div
      className={`shape-slab absolute flex select-none flex-col justify-between p-3 shadow-sm ${fill} ${text} ${
        todo.completed ? "opacity-60" : ""
      }`}
      style={{
        left: todo.position.x,
        top: todo.position.y,
        width: todo.size.width,
        height: todo.size.height,
        cursor: "grab",
      }}
      onPointerDown={handleDragPointerDown}
      onPointerMove={handleDragPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Pin marking this card as pinned to the board, echoing the
          AppHeader "Pin all done" affordance rather than a generic
          checkmark or dot. */}
      <PinTack
        className={`absolute left-2.5 top-2.5 h-3 w-3 ${
          todo.completed ? "opacity-50" : "opacity-80"
        }`}
      />

      {/* Controls */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onToggle(todo.id)}
          className={`rounded-[8px] border bg-transparent px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide transition duration-150 ${control}`}
        >
          {todo.completed ? "Undo" : "Done"}
        </button>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(todo.id)}
          className={`rounded-[8px] border bg-transparent px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wide transition duration-150 ${control}`}
        >
          Delete
        </button>
      </div>

      {/* Title + subtasks, centered like a case card */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1.5 px-1 text-center">
        <span className="font-display text-[11px] font-bold uppercase tracking-wide">
          {todo.text}
        </span>

        {todo.subtasks.length > 0 && (
          <ul className="flex flex-col gap-0.5 font-mono text-[10px] leading-snug">
            {todo.subtasks.map((step, index) => (
              <li
                key={`${todo.id}-step-${index}`}
                className="flex items-center gap-1.5"
              >
                <span
                  className="inline-block h-1 w-1 shrink-0 rounded-full bg-current opacity-60"
                  aria-hidden="true"
                />
                {step}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Resize handle, cut on the same diagonal as the card's own
          corner so it reads as part of the slab, not a bolted-on
          black square. */}
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="shape-slab absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-black/20"
      />
    </div>
  );
}
