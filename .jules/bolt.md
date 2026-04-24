## 2024-04-24 - React DnD and Child Rendering
**Learning:** React DnD `useDrop` hook operations trigger frequent parent re-renders on drag/drop state changes. Without memoizing draggable child components, this causes severe O(n) re-renders, particularly when a user interacts with list elements.
**Action:** Always wrap draggable child elements of a list in `React.memo()` when the parent contains the drop zone state.
