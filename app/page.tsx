"use client";

import { useState } from "react";
import { AppHeader } from "../components/AppHeader";
import { FilterTabs } from "../components/FilterTabs";
import { TodoCanvas } from "../components/TodoCanvas";
import { useTodos } from "../hooks/useTodos";

export default function Page() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    todos,
    filteredTodos,
    filter,
    setFilter,
    remaining,
    completedCount,
    allDone,
    createTodo,
    toggleTodo,
    deleteTodo,
    moveTodo,
    resizeTodo,
    clearCompleted,
    toggleAll,
  } = useTodos();

  return (
    <div className="relative h-screen w-full overflow-hidden bg-background">
      {/* The canvas IS the viewport — full-bleed layout */}
      <TodoCanvas
        todos={filteredTodos}
        filter={filter}
        onCreate={createTodo}
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        onMove={moveTodo}
        onResize={resizeTodo}
      />

      {/* Floating Header Toolbar with smooth transition wrapper */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex justify-center px-6 py-6 transition-all duration-300">
        <div className="pointer-events-auto w-full max-w-3xl rounded-[24px] border border-border/55 bg-card/85 p-5 shadow-2xl backdrop-blur-xl">
          <AppHeader
            total={todos.length}
            remaining={remaining}
            completed={completedCount}
            allDone={allDone}
            onToggleAll={toggleAll}
            isMenuOpen={isMenuOpen}
            onToggleMenu={() => setIsMenuOpen(!isMenuOpen)}
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
