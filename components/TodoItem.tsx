"use client";

import { useRef, useState } from "react";
import type { Todo } from "../types";

interface TodoItemProps {
  todo: Todo;
  isLast: boolean;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string, text: string) => void;
}

interface GridPoint {
  row: number;
  column: number;
}

const GRID_SIZE = 8;
const CELL_SIZE = 48;

function normalizeSelection(start: GridPoint, end: GridPoint) {
  const startRow = Math.min(start.row, end.row);
  const endRow = Math.max(start.row, end.row);

  const startColumn = Math.min(start.column, end.column);

  const endColumn = Math.max(start.column, end.column);

  return {
    startRow,
    endRow,
    startColumn,
    endColumn,
    width: endColumn - startColumn + 1,
    height: endRow - startRow + 1,
  };
}

export function TodoItem({
  todo,
  isLast,
  onToggle,
  onDelete,
  onEdit,
}: TodoItemProps) {
  const gridRef = useRef<HTMLDivElement | null>(null);

  const [selectionStart, setSelectionStart] = useState<GridPoint | null>(null);

  const [selectionEnd, setSelectionEnd] = useState<GridPoint | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);

  /*
   * Convert mouse position into an 8x8 grid coordinate.
   */
  const getGridPoint = (
    event: React.PointerEvent<HTMLDivElement>,
  ): GridPoint | null => {
    if (!gridRef.current) {
      return null;
    }

    const rect = gridRef.current.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const column = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);

    if (column < 0 || column >= GRID_SIZE || row < 0 || row >= GRID_SIZE) {
      return null;
    }

    return {
      row,
      column,
    };
  };

  /*
   * Start selecting cells.
   */
  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    const point = getGridPoint(event);

    if (!point) {
      return;
    }

    setSelectionStart(point);
    setSelectionEnd(point);
    setIsSelecting(true);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  /*
   * Update selection while dragging.
   */
  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSelecting) {
      return;
    }

    const point = getGridPoint(event);

    if (!point) {
      return;
    }

    setSelectionEnd(point);
  };

  /*
   * Finish selection.
   */
  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isSelecting) {
      return;
    }

    setIsSelecting(false);

    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      // Pointer capture may already be released.
    }
  };

  const selection =
    selectionStart && selectionEnd
      ? normalizeSelection(selectionStart, selectionEnd)
      : null;

  /*
   * Check whether a particular cell is inside
   * the currently selected rectangle.
   */
  const isCellSelected = (row: number, column: number) => {
    if (!selection) {
      return false;
    }

    return (
      row >= selection.startRow &&
      row <= selection.endRow &&
      column >= selection.startColumn &&
      column <= selection.endColumn
    );
  };

  return (
    <li className="list-none">
      <div className="mb-6">
        {/* ================================================
            Task information
            ================================================ */}

        <div className="mb-3 flex items-center justify-between">
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-text">
              {todo.text}
            </div>

            <div className="mt-1 font-mono text-[10px] text-text-faint">
              {selection
                ? `${selection.startColumn},${selection.startRow} → ${selection.endColumn},${selection.endRow}`
                : "Select an area on the grid"}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(todo.id)}
              className={`rounded-md border px-2 py-1 text-[10px] transition ${
                todo.completed
                  ? "border-thread-done text-thread-done"
                  : "border-border-strong text-text-faint hover:border-thread hover:text-thread"
              }`}
            >
              {todo.completed ? "Done" : "Complete"}
            </button>

            <button
              type="button"
              onClick={() => onDelete(todo.id)}
              className="rounded-md border border-border-strong px-2 py-1 text-[10px] text-text-faint transition hover:border-thread-done hover:text-thread-done"
            >
              Delete
            </button>
          </div>
        </div>

        {/* ================================================
            8 × 8 Grid
            ================================================ */}

        <div
          ref={gridRef}
          className="relative select-none overflow-hidden rounded-lg border border-border-strong bg-[#151614]"
          style={{
            width: GRID_SIZE * CELL_SIZE,
            height: GRID_SIZE * CELL_SIZE,
            touchAction: "none",
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={() => {
            setIsSelecting(false);
          }}
        >
          {/* Grid cells */}

          {Array.from({
            length: GRID_SIZE * GRID_SIZE,
          }).map((_, index) => {
            const row = Math.floor(index / GRID_SIZE);

            const column = index % GRID_SIZE;

            const selected = isCellSelected(row, column);

            return (
              <div
                key={`${row}-${column}`}
                className={`absolute border-r border-b transition-colors ${
                  selected
                    ? "bg-thread/20"
                    : "bg-transparent hover:bg-white/[0.04]"
                }`}
                style={{
                  left: column * CELL_SIZE,
                  top: row * CELL_SIZE,
                  width: CELL_SIZE,
                  height: CELL_SIZE,
                  borderColor: "rgba(110,125,119,0.22)",
                }}
              >
                {/* Coordinate */}

                <span
                  className={`absolute left-1 top-1 font-mono text-[8px] ${
                    selected ? "text-thread" : "text-text-faint/40"
                  }`}
                >
                  {column},{row}
                </span>
              </div>
            );
          })}

          {/* Selection outline */}

          {selection && (
            <div
              className="pointer-events-none absolute border-2 border-thread bg-thread/10"
              style={{
                left: selection.startColumn * CELL_SIZE + 1,
                top: selection.startRow * CELL_SIZE + 1,
                width: selection.width * CELL_SIZE - 2,
                height: selection.height * CELL_SIZE - 2,
              }}
            >
              <div className="absolute left-1 top-1 rounded bg-[#151614]/90 px-1.5 py-0.5 font-mono text-[9px] text-thread">
                {selection.width} × {selection.height}
              </div>
            </div>
          )}
        </div>

        {/* ================================================
            Selection information
            ================================================ */}

        {selection && (
          <div className="mt-2 flex items-center justify-between">
            <span className="font-mono text-[10px] text-text-faint">
              Position: {selection.startColumn},{selection.startRow}
            </span>

            <span className="font-mono text-[10px] text-thread">
              Size: {selection.width} × {selection.height}
            </span>
          </div>
        )}
      </div>
    </li>
  );
}
