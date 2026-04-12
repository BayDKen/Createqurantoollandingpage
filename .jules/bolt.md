## 2026-04-12 - Draggable Child Components React.memo()
**Learning:** When using React DnD within this project, heavily utilize React.memo() on draggable child components rendered in lists to prevent O(n) full re-renders when the parent drop zone state changes.
**Action:** Wrapping components like DraggableAnswer in memo() avoids re-rendering all list items on drag/drop state changes.
