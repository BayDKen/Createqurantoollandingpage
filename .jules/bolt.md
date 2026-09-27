## 2026-09-27 - Prevent React DnD Re-renders
**Learning:** In lists of draggable elements, changing parent drop zone state (like on hover/drop) triggers re-renders of all child `useDrag` components unless they are memoized. React DnD performance scales O(n) without it.
**Action:** Always wrap draggable child components inside DnD lists with `React.memo()` to ensure only the actively interacting elements re-render.
