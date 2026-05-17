## 2024-05-17 - React.memo for React DnD list items
**Learning:** In applications using React DnD for drag-and-drop interactions, when drop zones or draggable items exist in a list and the parent re-renders due to drop state changes, it triggers an O(n) re-render of all list items. This can be noticeably slow on lower-end devices or with large lists.
**Action:** Always wrap draggable child components rendered in lists with `React.memo()` to prevent unnecessary re-renders when the parent's state (like `droppedAnswer`) updates.
