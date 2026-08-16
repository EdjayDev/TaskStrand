export type TodoColor = "dark" | "core" | "bright" | "paper";

export interface TodoPosition {
  x: number;
  y: number;
}

export interface TodoSize {
  width: number;
  height: number;
}

export interface Todo {
  id: string;
  text: string;
  completed: boolean;

  // New: a task can carry its own short step list, shown as bullets
  // on its card (e.g. ["Find task", "Evaluate task", "Test task"]).
  subtasks: string[];

  // New: which strand tone this card renders as — dark / core /
  // bright / paper, the same four tones used for the header's stat
  // knots. Every card is cut from the same thread material rather
  // than an arbitrary color.
  color: TodoColor;

  // New: free-form placement and size on the shared canvas, in
  // pixels. No longer constrained to a fixed cell grid.
  position: TodoPosition;
  size: TodoSize;
}

export type Filter = "all" | "active" | "completed";
