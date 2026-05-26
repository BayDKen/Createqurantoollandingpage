## 2024-05-24 - React DnD Optimization
**Learning:** React DnD draggable child components rendered in lists cause O(n) full re-renders when the parent drop zone state changes.
**Action:** Heavily utilize `React.memo()` on draggable child components within this project to prevent these unnecessary re-renders.
