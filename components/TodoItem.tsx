"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  isLast: boolean; // last item gets a dangling tail instead of a strand to the next pin
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

// Shared stroke settings keep the two icons visually uniform (same weight,
// caps, and viewBox) rather than relying on inconsistent emoji glyphs.
const ICON_PROPS = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

function EditIcon() {
  return (
    <svg {...ICON_PROPS}>
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

// Scissors, styled to match EditIcon's weight — doubles as "cut the thread"
function CutIcon() {
  return (
    <svg {...ICON_PROPS}>
      <circle cx="6" cy="6" r="2.5" />
      <circle cx="6" cy="18" r="2.5" />
      <line x1="8.5" y1="7.5" x2="20" y2="19" />
      <line x1="8.5" y1="16.5" x2="20" y2="5" />
    </svg>
  );
}

export function TodoItem({
  todo,
  isLast,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const editRef = useRef<HTMLInputElement | null>(null);

  // Autofocus the input the moment we enter edit mode
  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  const commit = () => {
    onEdit(todo.id, draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(todo.text); // discard unsaved edits
    setIsEditing(false);
  };

  return (
    <li
      className={`task-item flex items-start gap-3 py-3 ${todo.completed ? "done" : ""}`}
    >
      <div
        className="node relative flex flex-col items-center w-5 shrink-0 pt-0.5"
        aria-hidden="true"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={todo.completed ? "Mark task active" : "Mark task done"}
          className="pin relative flex-shrink-0 rounded-full border-2 border-border-strong shadow-sm transition duration-200 hover:border-thread hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
          onClick={() => onToggle(todo.id)}
        />
        {isLast ? (
          <span className="tail-line" />
        ) : (
          <span className="strand-line animate-[twine-drift_7s_linear_infinite]" />
        )}
      </div>

      <div className="task-content flex-1 min-w-0 px-3 py-1.5">
        {isEditing ? (
          <input
            ref={editRef}
            className="edit-input w-full rounded-[12px] border border-thread bg-canvas-alt px-3 py-2 text-sm text-text outline-none transition focus:shadow-[0_0_0_3px_rgba(69,201,165,0.4)]"
            value={draft}
            maxLength={120}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") cancel();
            }}
          />
        ) : (
          <span
            className={`block cursor-text break-words text-base leading-6 ${todo.completed ? "text-text-faint line-through" : "text-text"}`}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className="task-actions flex gap-1 transition-opacity duration-200">
        {!isEditing && (
          <button
            type="button"
            className="icon-button inline-flex items-center justify-center rounded-[6px] p-1.5 text-text-faint transition duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-thread focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
          >
            <EditIcon />
          </button>
        )}
        <button
          type="button"
          className="icon-button inline-flex items-center justify-center rounded-[6px] p-1.5 text-text-faint transition duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-thread-done focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          <CutIcon />
        </button>
      </div>
    </li>
  );
}
