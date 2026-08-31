## 2024-08-31 - React DnD Optimization with memo
**Learning:** In React DnD, dropping an item into a drop zone triggers re-renders on the parent component. If draggable items in lists are not memoized, it results in O(n) re-renders, causing performance drops on large lists.
**Action:** Always wrap draggable child components inside lists with `React.memo()` (or `memo` explicitly) to avoid unnecessary re-renders when parent drop zone state changes.
