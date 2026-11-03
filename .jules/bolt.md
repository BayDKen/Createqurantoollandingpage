## 2024-03-03 - React.memo on React-DnD components
**Learning:** In React DnD, when a drag begins, if the parent state updates, it can cause the entire list of draggable items to re-render. Wrapping Draggable list items in React.memo() is critical for preventing O(n) full re-renders when parent DnD state changes during drag operations.
**Action:** Always consider wrapping draggable child components with React.memo() to ensure that non-dragged sibling components are not re-rendered.
