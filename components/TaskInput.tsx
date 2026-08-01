"use client";

import { useRef, useState } from "react";
import styles from "./TaskInput.module.css";

interface TaskInputProps {
  onAdd: (text: string) => void;
  autoFocus?: boolean;
}

export function TaskInput({ onAdd, autoFocus }: TaskInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const submit = () => {
    if (!value.trim()) return;
    onAdd(value);
    setValue("");
    inputRef.current?.focus();
  };

  return (
    <div className={styles.toolbar}>
      <input
        ref={inputRef}
        type="text"
        className={styles.input}
        placeholder="What's the next thing to tie down?"
        value={value}
        maxLength={120}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button className={styles.addButton} onClick={submit} disabled={!value.trim()}>
        Add task
      </button>
    </div>
  );
}
