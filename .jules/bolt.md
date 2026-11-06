## 2024-11-06 - Optimizing Draggable Components with React.memo()
**Learning:** In a drag-and-drop interface (react-dnd), draggable child components in a list render O(n) times whenever the parent's drop zone state changes. Memoizing the draggable items significantly reduces unnecessary re-renders.
**Action:** Always wrap draggable child components in `React.memo()` when rendering lists in react-dnd, ensuring their props remain stable.
