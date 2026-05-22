## 2026-05-22 - Optimization: React DnD List Re-renders
**Learning:** In a React DnD implementation, when a draggable child component is rendered in a list, changing the drop zone state triggers full re-renders of all child components in the list. This O(n) re-render causes severe UI performance degradation with long lists.
**Action:** Heavily utilize `React.memo()` on draggable child components (e.g. `DraggableAnswer`) rendered in lists to prevent O(n) full re-renders when the parent drop zone state changes.
