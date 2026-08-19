## 2025-02-19 - React DnD Optimization
**Learning:** Draggable child components within lists using React DnD can cause O(n) full re-renders for all list items whenever the parent's drop zone state changes, causing noticeable performance degradation.
**Action:** Use `React.memo()` to wrap draggable list items, ensuring that only the components with actual prop changes re-render when drag-and-drop state updates.
