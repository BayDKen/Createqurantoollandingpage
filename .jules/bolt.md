## 2025-02-27 - React DnD List Re-render Optimization
**Learning:** When using React DnD within this project, rendering draggable child components in lists causes O(n) full re-renders when the parent drop zone state changes.
**Action:** Heavily utilize `React.memo()` on draggable child components rendered in lists to prevent unnecessary re-renders.