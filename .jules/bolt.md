## 2024-05-18 - React DnD Anti-pattern
**Learning:** `DraggableAnswer` in `practice-page.tsx` is being rendered in a list within a React DnD context but lacks memoization, potentially causing O(n) re-renders when drag state or parent state changes. This is a crucial codebase-specific anti-pattern observed with `react-dnd` usage.
**Action:** Always wrap draggable/droppable list item components with `React.memo` when implementing drag-and-drop to prevent performance degradation on large lists.
