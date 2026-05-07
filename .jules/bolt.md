## 2026-05-07 - React DnD List Performance
**Learning:** Unmemoized draggable list items in React DnD cause O(n) full re-renders whenever the parent drop zone state updates (e.g. tracking dragging state or drops).
**Action:** Always wrap draggable child components rendered in lists with `React.memo()` when using React DnD to prevent these costly re-renders.
