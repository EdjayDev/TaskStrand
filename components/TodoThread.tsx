"use client";

import type { Filter, Todo } from "../types";
import { TodoItem } from "./TodoItem";
import { EmptyState } from "./EmptyState";

interface TodoThreadProps {
  todos: Todo[];
  filter: Filter;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

export function TodoThread({
  todos,
  filter,
  onToggle,
  onDelete,
  onEdit,
}: TodoThreadProps) {
  if (todos.length === 0) {
    return <EmptyState filter={filter} />;
  }

  return (
    <ul className="m-0 flex list-none flex-col p-0">
      {todos.map((todo, index) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          isLast={index === todos.length - 1}
          onToggle={onToggle}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      ))}
    </ul>
  );
}
