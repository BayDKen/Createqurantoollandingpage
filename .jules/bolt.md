## 2024-05-14 - React DnD Performance with Lists
**Learning:** Using React DnD drag sources rendered within a list (e.g. `DraggableAnswer` components) can cause O(n) re-renders when the parent drop zone's state updates during drag/drop interactions, severely degrading performance.
**Action:** Always wrap draggable child components in `React.memo()` when they are rendered inside lists tied to frequent parent state updates.
