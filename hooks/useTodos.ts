"use client";

import { useEffect, useMemo, useState } from "react";
import type { Filter, Todo, TodoColor, TodoPosition, TodoSize } from "../types";
import { loadTodos, saveTodos } from "../lib/storage";

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `todo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const DEFAULT_SIZE: TodoSize = { width: 220, height: 130 };
const COLOR_CYCLE: TodoColor[] = ["green", "blue", "orange", "thread"];

// New cards default in a loose cascade so they don't all land in
// exactly the same spot on the canvas.
function defaultPosition(index: number): TodoPosition {
  const column = index % 5;
  const row = Math.floor(index / 5);
  return {
    x: 24 + column * (DEFAULT_SIZE.width + 24),
    y: 24 + row * (DEFAULT_SIZE.height + 24),
  };
}

// Anything saved before position/size/color/subtasks existed needs
// to be backfilled, or TodoCard crashes reading todo.position.x on
// old cached data.
function migrateTodo(todo: Todo, index: number): Todo {
  return {
    ...todo,
    subtasks: todo.subtasks ?? [],
    color: todo.color ?? COLOR_CYCLE[index % COLOR_CYCLE.length],
    position: todo.position ?? defaultPosition(index),
    size: todo.size ?? DEFAULT_SIZE,
  };
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage once on mount.
  useEffect(() => {
    const loaded = loadTodos();
    setTodos(loaded.map((todo, index) => migrateTodo(todo, index)));
    setHydrated(true);
  }, []);

  // Persist after hydration only, so the initial empty array never
  // overwrites what was actually saved.
  useEffect(() => {
    if (hydrated) saveTodos(todos);
  }, [todos, hydrated]);

  const addTodo = (text: string) => {
    const value = text.trim();
    if (!value) return;
    const next: Todo = {
      id: createId(),
      text: value,
      completed: false,
      subtasks: [],
      color: COLOR_CYCLE[todos.length % COLOR_CYCLE.length],
      position: defaultPosition(todos.length),
      size: DEFAULT_SIZE,
    };
    setTodos((prev) => [next, ...prev]);
  };

  // Used by the canvas, where the card is created with its own
  // position/size/color/subtasks already set from the drag gesture.
  const createTodo = (todo: Todo) => {
    setTodos((prev) => [todo, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo,
      ),
    );
  };

  const deleteTodo = (id: string) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const editTodo = (id: string, text: string) => {
    const value = text.trim();
    if (!value) {
      deleteTodo(id);
      return;
    }
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)),
    );
  };

  const moveTodo = (id: string, position: TodoPosition) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, position } : todo)),
    );
  };

  const resizeTodo = (id: string, size: TodoSize) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, size } : todo)),
    );
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const toggleAll = () => {
    const allDone = todos.length > 0 && todos.every((todo) => todo.completed);
    setTodos((prev) => prev.map((todo) => ({ ...todo, completed: !allDone })));
  };

  const filteredTodos = useMemo(() => {
    if (filter === "active") return todos.filter((todo) => !todo.completed);
    if (filter === "completed") return todos.filter((todo) => todo.completed);
    return todos;
  }, [todos, filter]);

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );
  const completedCount = todos.length - remaining;
  const allDone = todos.length > 0 && remaining === 0;

  return {
    todos,
    filteredTodos,
    filter,
    setFilter,
    remaining,
    completedCount,
    allDone,
    addTodo,
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    moveTodo,
    resizeTodo,
    clearCompleted,
    toggleAll,
  };
}
