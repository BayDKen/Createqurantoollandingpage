## 2024-05-25 - React DnD List Memoization
**Learning:** In React drag-and-drop implementations, draggable child components inside lists are highly susceptible to O(n) full re-renders when the parent drop zone state changes.
**Action:** Always wrap draggable list items with `React.memo()` when their props maintain referential equality, ensuring smoother drag performance and preventing unnecessary DOM reconciliation.
