## 2024-05-18 - Memoize react-dnd list components
**Learning:** In applications using react-dnd, the continuous updates to the parent's drag/drop zone state during hover/drag interactions cause O(n) full re-renders of all sibling list items unless explicitly memoized.
**Action:** Always wrap draggable list items and static list items in `React.memo` when rendered inside an actively updated drag/drop parent context.
