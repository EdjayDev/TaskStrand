"use client";

import { useState } from "react";
import { Landing } from "../components/Landing";
import { AppHeader } from "../components/AppHeader";
import { TaskInput } from "../components/TaskInput";
import { FilterTabs } from "../components/FilterTabs";
import { TodoCanvas } from "../components/TodoCanvas";
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
    createTodo,
    toggleTodo,
    editTodo,
    deleteTodo,
    moveTodo,
    resizeTodo,
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

        <TodoCanvas
          todos={filteredTodos}
          filter={filter}
          onCreate={createTodo}
          onToggle={toggleTodo}
          onDelete={deleteTodo}
          onMove={moveTodo}
          onResize={resizeTodo}
        />
      </div>
    </div>
  );
}
