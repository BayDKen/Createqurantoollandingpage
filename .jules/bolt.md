## 2024-05-18 - Memoize React-DnD DraggableAnswer
**Learning:** In a React DnD environment where the drop zone state changes frequently, list components that render draggable items (like `DraggableAnswer`) will suffer O(n) full re-renders unless explicitly wrapped in `React.memo()`.
**Action:** Use `React.memo()` on draggable child components rendered in lists to prevent unnecessary re-renders when the parent's drop zone state changes.
