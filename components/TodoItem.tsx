"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "../types";
import styles from "./TodoItem.module.css";

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
    <li className={`${styles.item} ${todo.completed ? styles.done : ""}`}>
      {/* Pin + connector column. Purely visual, hence aria-hidden — the
          checkbox semantics live on the pin button itself. */}
      <div className={styles.node} aria-hidden="true">
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={todo.completed ? "Mark task active" : "Mark task done"}
          className={styles.pin}
          onClick={() => onToggle(todo.id)}
        />
        {isLast ? (
          <span className={styles.tail} />
        ) : (
          <span className={styles.strand} />
        )}
      </div>

      <div className={styles.content}>
        {isEditing ? (
          <input
            ref={editRef}
            className={styles.editInput}
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
            className={styles.text}
            onDoubleClick={() => setIsEditing(true)}
          >
            {todo.text}
          </span>
        )}
      </div>

      <div className={styles.actions}>
        {!isEditing && (
          <button
            type="button"
            className={styles.iconButton}
            onClick={() => setIsEditing(true)}
            aria-label="Edit task"
          >
            <EditIcon />
          </button>
        )}
        {/* deleteButton class is targeted by a :has() selector in the CSS
            to fray the strand on hover before the cut */}
        <button
          type="button"
          className={`${styles.iconButton} ${styles.deleteButton}`}
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          <CutIcon />
        </button>
      </div>
    </li>
  );
}
