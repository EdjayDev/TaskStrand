"use client";

import { useState } from "react";
import { Landing } from "../components/Landing";
import { AppHeader } from "../components/AppHeader";
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
    <div className="relative h-screen w-full overflow-hidden">
      {/* The canvas IS the viewport now — full-bleed, no wrapper card */}
      <TodoCanvas
        todos={filteredTodos}
        filter={filter}
        onCreate={createTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onMove={moveTodo}
        onResize={resizeTodo}
      />

      {/* Everything else floats on top as a toolbar, not a container */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 py-6">
        <div className="pointer-events-auto w-full max-w-3xl rounded-[20px] border border-border bg-card/90 p-5 shadow-card backdrop-blur">
          <AppHeader
            total={todos.length}
            remaining={remaining}
            completed={completedCount}
            allDone={allDone}
            onToggleAll={toggleAll}
          />

          <FilterTabs
            filter={filter}
            onChange={setFilter}
            completedCount={completedCount}
            onClearCompleted={clearCompleted}
          />
        </div>
      </div>
    </div>
  );
}
