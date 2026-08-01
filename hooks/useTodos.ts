"use client";

import { useEffect, useMemo, useState } from "react";
import type { Filter, Todo } from "../types";
import { loadTodos, saveTodos } from "../lib/storage";

function createId(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `todo_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

export function useTodos() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from storage once on mount.
  useEffect(() => {
    setTodos(loadTodos());
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
      createdAt: Date.now(),
    };
    setTodos((prev) => [next, ...prev]);
  };

  const toggleTodo = (id: string) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
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
    setTodos((prev) => prev.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)));
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

  const remaining = useMemo(() => todos.filter((todo) => !todo.completed).length, [todos]);
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
    toggleTodo,
    editTodo,
    deleteTodo,
    clearCompleted,
    toggleAll,
  };
}
