## 2024-04-03 - React DnD Performance Bottleneck
**Learning:** Draggable child components rendered in lists within this project experience O(n) full re-renders when the parent drop zone state changes, causing noticeable lag.
**Action:** Heavily utilize `React.memo()` on draggable child components (like `DraggableAnswer`) rendered in lists to prevent unnecessary re-renders when the parent state updates.
