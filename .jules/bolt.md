## 2024-05-19 - React DnD Draggable Item Performance

**Learning:** Draggable list items implemented with `react-dnd` (like `DraggableAnswer`) render frequently and individually within large lists when the parent drop zone updates its status on drag operations. Without memoization, dropping an item triggers full O(n) re-renders for all sibling elements, leading to noticeable UI stuttering.

**Action:** Always wrap repeating, stateless child nodes (particularly components inside `react-dnd` loops) with `React.memo` to skip extraneous renders when drop zone state updates.
