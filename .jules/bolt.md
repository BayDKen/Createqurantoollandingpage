## 2024-05-18 - React DnD Performance in Lists
**Learning:** Using React DnD hooks (`useDrag`, `useDrop`) inside mapped list components without `React.memo` causes O(n) full re-renders whenever the parent's drag state changes.
**Action:** Always wrap draggable child components (like `DraggableAnswer`) in `React.memo` when rendering them inside a list to ensure only the dragged item and the drop zone re-render, reducing unnecessary work on unchanged items.
