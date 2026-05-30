## 2025-02-21 - [Prevent O(n) re-renders for React DnD list]
**Learning:** Using React DnD without memoizing list items causes O(n) full re-renders of the draggable children list whenever parent drop zone state (like a timer or drag selection) changes.
**Action:** Heavily utilize `React.memo()` on draggable child components rendered in lists within React DnD components to prevent these unnecessary re-renders and improve performance.
