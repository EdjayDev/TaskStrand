"use client";

import { useEffect, useRef, useState } from "react";
import type { Todo } from "../types";
import styles from "./TodoItem.module.css";

interface TodoItemProps {
  todo: Todo;
  isLast: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoItem({ todo, isLast, onToggle, onDelete, onEdit }: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(todo.text);
  const editRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (isEditing) editRef.current?.focus();
  }, [isEditing]);

  const commit = () => {
    onEdit(todo.id, draft);
    setIsEditing(false);
  };

  const cancel = () => {
    setDraft(todo.text);
    setIsEditing(false);
  };

  return (
    <li className={`${styles.item} ${todo.completed ? styles.done : ""}`}>
      <div className={styles.node} aria-hidden="true">
        <button
          type="button"
          role="checkbox"
          aria-checked={todo.completed}
          aria-label={todo.completed ? "Mark task active" : "Mark task done"}
          className={styles.pin}
          onClick={() => onToggle(todo.id)}
        />
        {!isLast && <span className={styles.strand} />}
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
          <span className={styles.text} onDoubleClick={() => setIsEditing(true)}>
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
        <button
          type="button"
          className={styles.iconButton}
          onClick={() => onDelete(todo.id)}
          aria-label="Delete task"
        >
          🗑️
        </button>
      </div>
    </li>
  );
}
