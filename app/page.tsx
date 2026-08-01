"use client";

import { useState } from "react";
import { Landing } from "../components/Landing";
import { AppHeader } from "../components/AppHeader";
import { TaskInput } from "../components/TaskInput";
import { FilterTabs } from "../components/FilterTabs";
import { TodoThread } from "../components/TodoThread";
import { useTodos } from "../hooks/useTodos";
import styles from "./page.module.css";

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
    <div className={styles.page}>
      <div className={styles.shell}>
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

        <div className={styles.threadViewport}>
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
