## 2024-03-24 - React DnD Performance Optimization
**Learning:** In applications heavily using react-dnd, the continuous updates of drag state (e.g. `monitor.isOver()` and `monitor.isDragging()`) cause all components using the drag/drop hooks to re-render. If these are rendered in a list or complex UI, this can result in O(n) re-renders, impacting interaction responsiveness.
**Action:** Always wrap draggable child components and drop zones with `React.memo()` so they only re-render if their explicit props (or hook state) actually change.
