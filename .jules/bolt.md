## 2026-07-30 - Memoize react-dnd child components
**Learning:** In react-dnd, draggable child components rendered in lists will trigger O(n) full re-renders when the parent drop zone state changes, leading to poor drag performance.
**Action:** Always heavily utilize `React.memo()` on draggable child components within this project's architecture.
