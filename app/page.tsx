"use client";

import { useState } from "react";
import { Landing } from "../components/Landing";
import { AppHeader } from "../components/AppHeader";
import { TaskInput } from "../components/TaskInput";
import { FilterTabs } from "../components/FilterTabs";
import { TodoThread } from "../components/TodoThread";
import { useTodos } from "../hooks/useTodos";

export default function Page() {
  const [started, setStarted] = useState(false);

  const {
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
  } = useTodos();

  if (!started) {
    return <Landing onStart={() => setStarted(true)} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-3xl rounded-[20px] bg-card border border-border p-10 shadow-card">
        <AppHeader
          total={todos.length}
          remaining={remaining}
          completed={completedCount}
          allDone={allDone}
          onToggleAll={toggleAll}
        />

        <TaskInput onAdd={addTodo} autoFocus />

        <FilterTabs
          filter={filter}
          onChange={setFilter}
          completedCount={completedCount}
          onClearCompleted={clearCompleted}
        />

        <div className="max-h-[400px] overflow-y-auto pr-1.5">
          <TodoThread
            todos={filteredTodos}
            filter={filter}
            onToggle={toggleTodo}
            onDelete={deleteTodo}
            onEdit={editTodo}
          />
        </div>
      </div>
    </div>
  );
}
