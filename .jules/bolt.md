## 2025-02-18 - [React DnD Memoization]
**Learning:** React DnD `useDrop` and `useDrag` performance bottleneck: Dragging items in lists can cause O(n) re-renders if draggable items are not memoized, particularly when parent component state updates during the drag/drop cycle.
**Action:** Use `React.memo` on Draggable child components when rendered in a list within a React DnD context to prevent unnecessary re-renders of all siblings when one item is dragged/dropped.
