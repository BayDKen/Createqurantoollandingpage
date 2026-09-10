## 2024-03-24 - Draggable Answer Component Optimization
**Learning:** `DraggableAnswer` component is used in a list that gets re-rendered when drag states change or parent updates, potentially causing O(n) full re-renders for every child. Since it only depends on a few props and uses react-dnd, memoization is highly effective here as indicated by my memory about `React.memo()` and react-dnd.
**Action:** Always wrap draggable child components in `memo()` when rendered in lists where parent drop zone state changes.
