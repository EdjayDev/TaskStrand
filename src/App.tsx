import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

type Todo = {
  id: string
  text: string
  completed: boolean
  createdAt: number
}

type Filter = 'all' | 'active' | 'completed'

function App() {
  const [started, setStarted] = useState(false)
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const inputRef = useRef<HTMLInputElement | null>(null)

  // Load todos safely
  useEffect(() => {
    try {
      const saved = localStorage.getItem('todos')
      if (saved) {
        const parsed: Todo[] = JSON.parse(saved)
        if (Array.isArray(parsed)) {
          setTodos(parsed)
        }
      }
    } catch (error) {
      console.error('Failed to load todos:', error)
    }
  }, [])

  // Save todos
  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos))
  }, [todos])

  // Focus input after starting
  useEffect(() => {
    if (started) {
      inputRef.current?.focus()
    }
  }, [started])

  const addTodo = () => {
    const value = input.trim()
    if (!value) return

    const newTodo: Todo = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      text: value,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos(prev => [newTodo, ...prev])
    setInput('')
    inputRef.current?.focus()
  }

  const toggleTodo = (id: string) => {
    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    )
  }

  const deleteTodo = (id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id))
    if (editingId === id) {
      cancelEdit()
    }
  }

  const clearCompleted = () => {
    setTodos(prev => prev.filter(todo => !todo.completed))
  }

  const completeAll = () => {
    const allCompleted = todos.every(todo => todo.completed)
    setTodos(prev =>
      prev.map(todo => ({
        ...todo,
        completed: !allCompleted,
      }))
    )
  }

  const startEdit = (todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditText('')
  }

  const saveEdit = (id: string) => {
    const value = editText.trim()
    if (!value) {
      deleteTodo(id)
      return
    }

    setTodos(prev =>
      prev.map(todo =>
        todo.id === id ? { ...todo, text: value } : todo
      )
    )
    cancelEdit()
  }

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter(todo => !todo.completed)
      case 'completed':
        return todos.filter(todo => todo.completed)
      default:
        return todos
    }
  }, [todos, filter])

  const remaining = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos]
  )

  const completedCount = useMemo(
    () => todos.filter(todo => todo.completed).length,
    [todos]
  )

  if (!started) {
    return (
      <div className="app-container">
        <header className="hero">
          <h1>Todo Manager</h1>
          <p className="subtitle">Manage your daily workflow efficiently.</p>
          <button className="start-btn" onClick={() => setStarted(true)}>
            Get Started
          </button>
        </header>
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="top-bar">
        <div>
          <h1>My Tasks</h1>
          <p className="task-summary">
            {todos.length} total • {remaining} remaining • {completedCount} completed
          </p>
        </div>

        {todos.length > 0 && (
          <button onClick={completeAll}>
            {remaining === 0 ? 'Uncheck All' : 'Complete All'}
          </button>
        )}
      </header>

      <div className="todo-input">
        <input
          ref={inputRef}
          type="text"
          placeholder="Enter a task..."
          value={input}
          maxLength={120}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              addTodo()
            }
          }}
        />
        <button onClick={addTodo} disabled={!input.trim()}>
          Add
        </button>
      </div>

      <div className="filters">
        {(['all', 'active', 'completed'] as Filter[]).map(item => (
          <button
            key={item}
            className={filter === item ? 'active' : ''}
            onClick={() => setFilter(item)}
          >
            {item}
          </button>
        ))}
      </div>

      {todos.length > 0 && (
        <div className="todo-meta">
          <span>{remaining} tasks remaining</span>
          {completedCount > 0 && (
            <button onClick={clearCompleted}>Clear completed</button>
          )}
        </div>
      )}

      <ul className="todo-list">
        {filteredTodos.length === 0 ? (
          <p className="empty-state">No tasks found.</p>
        ) : (
          filteredTodos.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${todo.completed ? 'done' : ''}`}
            >
              <div className="todo-content">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id)}
                />

                {editingId === todo.id ? (
                  <input
                    className="edit-input"
                    value={editText}
                    autoFocus
                    maxLength={120}
                    onChange={e => setEditText(e.target.value)}
                    onBlur={() => saveEdit(todo.id)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        saveEdit(todo.id)
                      }
                      if (e.key === 'Escape') {
                        cancelEdit()
                      }
                    }}
                  />
                ) : (
                  <span
                    className={todo.completed ? 'completed' : ''}
                    onDoubleClick={() => startEdit(todo)}
                  >
                    {todo.text}
                  </span>
                )}
              </div>

              <div className="todo-actions">
                <button onClick={() => startEdit(todo)}>Edit</button>
                <button onClick={() => deleteTodo(todo.id)}>Delete</button>
              </div>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}

export default App
