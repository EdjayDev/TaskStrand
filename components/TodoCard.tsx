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

const MIN_WIDTH = 180;
const MIN_HEIGHT = 110;

// Solid fills only — no gradients, no opacity blends. Matches the
// flat-color reference (green / blue / orange), plus "thread" to
// stay consistent with the rest of the app's palette.
const COLOR_FILL: Record<TodoColor, string> = {
  green: "bg-[#6AA84F]",
  blue: "bg-[#4A90D9]",
  orange: "bg-[#E8821E]",
  thread: "bg-thread",
};

export function TodoCard({ todo, onToggle, onDelete, onMove, onResize }: TodoCardProps) {
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
   * control (button) or the resize handle.
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
      x: Math.max(0, dragOrigin.current.cardX + deltaX),
      y: Math.max(0, dragOrigin.current.cardY + deltaY),
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
   */
  const handleResizePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
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

  const handleResizePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!resizeOrigin.current) return;

    const deltaX = event.clientX - resizeOrigin.current.pointerX;
    const deltaY = event.clientY - resizeOrigin.current.pointerY;

    onResize(todo.id, {
      width: Math.max(MIN_WIDTH, resizeOrigin.current.width + deltaX),
      height: Math.max(MIN_HEIGHT, resizeOrigin.current.height + deltaY),
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

  return (
    <div
      className={`absolute flex select-none flex-col justify-between p-3 text-white shadow-sm ${COLOR_FILL[todo.color]} ${
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
      {/* Controls */}
      <div className="flex items-center justify-end gap-1">
        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onToggle(todo.id)}
          className="rounded border border-white/0 bg-[#151614] px-1.5 py-0.5 text-[9px] text-white"
        >
          {todo.completed ? "Undo" : "Done"}
        </button>

        <button
          type="button"
          onPointerDown={(event) => event.stopPropagation()}
          onClick={() => onDelete(todo.id)}
          className="rounded border border-white/0 bg-[#151614] px-1.5 py-0.5 text-[9px] text-white"
        >
          Delete
        </button>
      </div>

      {/* Title + subtasks, centered like a case card */}
      <div className="flex flex-1 flex-col items-center justify-center gap-1 px-1 text-center">
        <span className="text-[11px] font-bold uppercase tracking-wide">
          {todo.text}
        </span>

        {todo.subtasks.length > 0 && (
          <ul className="text-[10px] leading-snug">
            {todo.subtasks.map((step, index) => (
              <li key={`${todo.id}-step-${index}`}>- {step}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Resize handle */}
      <div
        onPointerDown={handleResizePointerDown}
        onPointerMove={handleResizePointerMove}
        onPointerUp={endResize}
        onPointerCancel={endResize}
        className="absolute bottom-0 right-0 h-4 w-4 cursor-nwse-resize bg-[#151614]"
      />
    </div>
  );
}
