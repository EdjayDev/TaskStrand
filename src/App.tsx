import { useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: number;
};

type Filter = "all" | "active" | "completed";

function App() {
  const [started, setStarted] = useState(false);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Load todos safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem("todos");
      if (saved) {
        const parsed: Todo[] = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setTodos(parsed);
        }
      }
    } catch (error) {
      console.error("Failed to load todos:", error);
    }
  }, []);

  // Save todos
  useEffect(() => {
    localStorage.setItem("todos", JSON.stringify(todos));
  }, [todos]);

  // Focus input after starting
  useEffect(() => {
    if (started) {
      inputRef.current?.focus();
    }
  }, [started]);

  const addTodo = () => {
    const value = input.trim();
    if (!value) return;

    const newTodo: Todo = {
      id:
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : String(Date.now()),
      text: value,
      completed: false,
      createdAt: Date.now(),
    };

    setTodos((prev) => [newTodo, ...prev]);
    setInput("");
    inputRef.current?.focus();
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
    if (editingId === id) {
      cancelEdit();
    }
  };

  const clearCompleted = () => {
    setTodos((prev) => prev.filter((todo) => !todo.completed));
  };

  const completeAll = () => {
    const allCompleted = todos.every((todo) => todo.completed);
    setTodos((prev) =>
      prev.map((todo) => ({
        ...todo,
        completed: !allCompleted,
      })),
    );
  };

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id);
    setEditText(todo.text);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const saveEdit = (id: string) => {
    const value = editText.trim();
    if (!value) {
      deleteTodo(id);
      return;
    }

    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, text: value } : todo)),
    );
    cancelEdit();
  };

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  const remaining = useMemo(
    () => todos.filter((todo) => !todo.completed).length,
    [todos],
  );

  const completedCount = useMemo(
    () => todos.filter((todo) => todo.completed).length,
    [todos],
  );

  if (!started) {
    return (
      <div className="taskstrand-landing">
        <div className="landing-glow" />
        <div className="landing-card">
          <div className="brand-badge">✨ TaskStrand Engine</div>
          <h1>Organize your workflow with absolute clarity.</h1>
          <p className="subtitle">
            A frictionless, modern minimalist space designed to capture
            thoughts, track daily execution, and get things done.
          </p>
          <button className="cta-btn" onClick={() => setStarted(true)}>
            Get Started <span>&rarr;</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="taskstrand-app">
      <div className="app-shell">
        <header className="app-header">
          <div className="header-info">
            <h1>TaskStrand</h1>
            <p className="task-summary">
              <span>
                <strong>{todos.length}</strong> total
              </span>
              <span className="dot">•</span>
              <span>
                <strong>{remaining}</strong> pending
              </span>
              <span className="dot">•</span>
              <span>
                <strong>{completedCount}</strong> done
              </span>
            </p>
          </div>

          {todos.length > 0 && (
            <button className="secondary-action-btn" onClick={completeAll}>
              {remaining === 0 ? "Mark All Incomplete" : "Complete All"}
            </button>
          )}
        </header>

        <div className="input-toolbar">
          <input
            ref={inputRef}
            type="text"
            placeholder="What needs to be done?"
            value={input}
            maxLength={120}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addTodo();
              }
            }}
          />
          <button
            className="add-btn"
            onClick={addTodo}
            disabled={!input.trim()}
          >
            Add Task
          </button>
        </div>

        <div className="control-panel">
          <div className="filters-group">
            {(["all", "active", "completed"] as Filter[]).map((item) => (
              <button
                key={item}
                className={`filter-tab ${filter === item ? "active" : ""}`}
                onClick={() => setFilter(item)}
              >
                {item.charAt(0).toUpperCase() + item.slice(1)}
              </button>
            ))}
          </div>

          {completedCount > 0 && (
            <button className="clear-btn" onClick={clearCompleted}>
              Clear Completed ({completedCount})
            </button>
          )}
        </div>

        <div className="todo-container">
          {filteredTodos.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📝</div>
              <p>No tasks found in this view.</p>
            </div>
          ) : (
            <ul className="todo-list">
              {filteredTodos.map((todo) => (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "done" : ""}`}
                >
                  <label className="checkbox-wrapper">
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => toggleTodo(todo.id)}
                    />
                    <span className="custom-checkbox"></span>
                  </label>

                  <div className="text-wrapper">
                    {editingId === todo.id ? (
                      <input
                        className="edit-input"
                        value={editText}
                        autoFocus
                        maxLength={120}
                        onChange={(e) => setEditText(e.target.value)}
                        onBlur={() => saveEdit(todo.id)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveEdit(todo.id);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                    ) : (
                      <span
                        className="todo-text"
                        onDoubleClick={() => startEdit(todo)}
                      >
                        {todo.text}
                      </span>
                    )}
                  </div>

                  <div className="todo-actions">
                    {editingId !== todo.id && (
                      <button
                        className="icon-btn edit"
                        onClick={() => startEdit(todo)}
                        title="Edit"
                      >
                        ✏️
                      </button>
                    )}
                    <button
                      className="icon-btn delete"
                      onClick={() => deleteTodo(todo.id)}
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
