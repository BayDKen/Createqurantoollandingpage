## 2024-05-15 - React DnD Re-renders in Draggable Lists
**Learning:** Using React DnD without memoizing draggable child components rendered in lists causes O(n) full re-renders of every list item when the parent drop zone state changes. This is a critical performance bottleneck specific to how React DnD integrates with React's render cycle.
**Action:** Always heavily utilize `React.memo()` on draggable child components rendered in lists to prevent these full re-renders when the parent drop zone state changes.
