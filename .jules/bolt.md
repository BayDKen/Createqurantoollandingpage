## 2024-05-21 - [Prevent O(n) re-renders in React DnD]
**Learning:** When using `react-dnd` with list items and a parent drop zone, state changes in the parent component (like tracking `isOver` or `canDrop`) cause expensive O(n) re-renders for all draggable child items.
**Action:** Always wrap draggable child components that are rendered in lists with `React.memo()` to prevent full list re-renders during drag-and-drop operations, optimizing for large item sets.
