## 2026-05-13 - React DnD Optimization
**Learning:** Using React DnD without memoizing draggable child components in a list leads to O(n) full re-renders when the parent drop zone state changes.
**Action:** Always wrap draggable child components rendered in lists with `React.memo()` to prevent unnecessary re-renders.
