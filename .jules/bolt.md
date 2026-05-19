## 2026-05-19 - [Draggable List Optimization]
**Learning:** When using react-dnd with a list of draggable child components, parent state changes (like when an item is dropped into a drop zone) trigger O(n) full re-renders for all list items.
**Action:** Always wrap draggable list items in React.memo() to ensure only the dragged item and the drop zone re-render, preserving application performance during drag-and-drop operations.
