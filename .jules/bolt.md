## 2024-05-18 - React DnD List Re-renders
**Learning:** Using React DnD without memoizing list items causes O(n) full re-renders of all draggable components when the parent drop zone state changes.
**Action:** Always wrap draggable child components rendered in lists with `memo()` to optimize performance and prevent unnecessary re-renders.
