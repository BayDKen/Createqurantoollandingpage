## 2025-02-28 - Optimizing React DnD List Render
**Learning:** React DnD's `useDrag` in a list item component like `DraggableAnswer` causes full list O(n) re-renders whenever the parent container's state updates (e.g. when an item is dropped).
**Action:** Always wrap draggable child components inside a parent drop zone with `React.memo()` so they skip rendering when their props haven't changed.
