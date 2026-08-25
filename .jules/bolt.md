## 2024-10-25 - React DnD List Re-renders
**Learning:** List items in React DnD that receive parent drop zone state (e.g., `isInDropZone`) can cause O(n) full list re-renders whenever the drop zone state changes if not memoized.
**Action:** Always use `React.memo()` (or `memo()`) for draggable child components rendered in lists to optimize performance when the parent drop zone updates.
