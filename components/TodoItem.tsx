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
            ✏️
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
          ✂️
        </button>
      </div>
    </li>
  );
}
