"use client";

import { useRef, useState } from "react";

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
    <div className="flex gap-2 mb-5">
      <input
        ref={inputRef}
        type="text"
        className="flex-1 min-w-0 rounded-[12px] border border-border bg-canvas-alt px-4 py-3 text-base text-text placeholder:text-text-faint outline-none transition focus:border-thread"
        placeholder="What's the next thing to tie down?"
        value={value}
        maxLength={120}
        autoFocus={autoFocus}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") submit();
        }}
      />
      <button
        className="rounded-[12px] bg-thread px-5 py-3 text-sm font-semibold text-canvas transition duration-200 hover:bg-thread-hover disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-thread focus-visible:ring-offset-2"
        onClick={submit}
        disabled={!value.trim()}
      >
        Add task
      </button>
    </div>
  );
}
