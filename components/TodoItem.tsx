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
    <li className="group flex items-start gap-3 py-3">
      <div
        className="relative flex w-5 flex-col items-center shrink-0 pt-0.5"
        aria-hidden="true"
      >
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={todo.completed ? "Mark task active" : "Mark task done"}
          className={`relative h-5 w-5 flex-shrink-0 rounded-full border-2 shadow-sm transition duration-200 hover:scale-110 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2 ${
            todo.completed
              ? "border-thread-done bg-thread-done shadow-[0_0_0_4px_rgba(125,226,209,0.28)]"
              : "border-border-strong bg-[radial-gradient(circle_at_32%_28%,rgba(255,255,255,0.35),transparent_55%),#2b2c28] hover:border-thread"
          }`}
          onClick={() => onToggle(todo.id)}
        >
          {todo.completed && (
            <span className="absolute left-1/2 top-1/2 h-[7px] w-[4px] -translate-x-1/2 -translate-y-1/2 rotate-45 border-b-2 border-r-2 border-canvas" />
          )}
        </button>
        {isLast ? (
          <span className="relative mt-1 h-4 w-[2px] bg-gradient-to-b from-border-strong to-transparent" />
        ) : (
          <span
            className={`mt-1 w-[3px] flex-1 min-h-[22px] ${
              todo.completed
                ? "bg-[linear-gradient(135deg,transparent_42%,#7de2d1_42%_58%,transparent_58%),linear-gradient(45deg,transparent_42%,#7de2d1_42%_58%,transparent_58%)] bg-[length:8px_8px] bg-repeat-y bg-center"
                : "animate-[twine-drift_7s_linear_infinite] bg-[repeating-linear-gradient(115deg,#3f534f_0_2px,transparent_2px_4px)] bg-[length:6px_12px] bg-repeat"
            }`}
          />
        )}
      </div>

      <div
        className={`flex-1 min-w-0 border-l-2 border-dashed px-3 py-1.5 transition-colors ${
          todo.completed
            ? "border-thread-done bg-white/[0.02]"
            : "border-border-strong group-hover:border-thread group-hover:bg-white/[0.03]"
        }`}
        style={{ borderRadius: "0 12px 12px 0" }}
      >
        {isEditing ? (
          <input
            ref={editRef}
            className="w-full rounded-[12px] border border-thread bg-canvas-alt px-3 py-2 text-sm text-text outline-none transition focus:shadow-[0_0_0_3px_rgba(69,201,165,0.4)]"
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

      <div className="flex gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        {!isEditing && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[6px] p-1.5 text-text-faint transition duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-thread focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
          >
            <EditIcon />
          </button>
        )}
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-[6px] p-1.5 text-text-faint transition duration-200 hover:bg-[rgba(255,255,255,0.06)] hover:text-thread-done focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          <CutIcon />
        </button>
      </div>
    </li>
  );
}
