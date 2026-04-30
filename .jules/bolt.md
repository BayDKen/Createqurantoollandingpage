## 2025-02-18 - Prevent O(n) re-renders in react-dnd lists
**Learning:** In React DnD, rendering draggable child components within a list causes O(n) re-renders whenever the parent drop zone's state changes (like when an item is dropped or hover state updates). Without memoization, every un-dragged child re-renders to reflect that no change occurred to them.
**Action:** Always wrap list items managed by `useDrag` in `React.memo()` to prevent O(n) full re-renders when parent state updates.
