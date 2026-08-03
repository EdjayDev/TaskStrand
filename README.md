# TaskStrand

A node-connected, thread-based task management web application built using React, TypeScript, and Vite, featuring an interactive visual canvas inspired by node linking and thread control workflows. This project emphasizes clean UI logic, robust state management, and optimized rendering behaviors.

---

## Key Features

* **Persistent Storage:** Tasks automatically synchronize with `localStorage`, featuring fail-safe `try/catch` JSON parsing to handle corrupted data safely.
* **State Optimization:** Utilizes `useMemo` hooks to prevent unnecessary filtering recalculations and sub-component re-renders when state changes.
* **Advanced Task Controls & Thread Management:** Features global "Complete All / Uncheck All" operations alongside a unified "Clear Completed" action, mapped across dynamic visual task threads.
* **Inline Editing:** Supports seamless inline item renaming with automatic text trimming, keyboard navigation bindings (`Enter` to save, `Escape` to cancel), and fallback auto-deletion on empty inputs.
* **Robust Unique IDs:** Employs a fallback random identifier strategy checking for modern `crypto.randomUUID` capabilities down to cross-browser timestamp math generation.

---

## Technical Stack

* **Framework:** React 18+
* **Language:** TypeScript (Strictly typed schemas for tasks, filter contexts, and node connections)
* **Build Tool:** Vite
* **State & Lifecycle Management:** `useState`, `useEffect`, `useMemo`, `useRef`

---

## Code Structure Insights

The core logic focuses closely on user workflow and data integrity:

* **Robust Component Lifecycle:** An initial `useEffect` runs once during mounting to read existing items, while a secondary dependency-tracked hook automatically pushes serialized mutation states back to the browser sandbox.
* **UX Accessibility:** Features programmatic auto-focus via a DOM `useRef` targeting text inputs instantly as soon as the splash screen is dismissed or an item is committed.

---

## Local Installation

To run this project locally, execute the following commands in your terminal:

1. **Clone the repository:**
```bash
    git clone [https://github.com/YOUR_USERNAME/task-strand.git](https://github.com/YOUR_USERNAME/task-strand.git)
    cd task-strand
