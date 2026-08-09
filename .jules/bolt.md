## 2024-08-09 - Missing memoization on list items
**Learning:** React DnD items often re-render when the parent drop zone updates (e.g. `droppedAnswer` changes), which causes O(n) re-renders in the list. Wrapping the list items in `memo()` prevents this.
**Action:** Identify list components rendered by `map()` in drag-and-drop scenarios and wrap them in `memo()`.
