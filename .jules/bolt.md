## 2024-06-23 - React.memo() on Draggable Component
**Learning:** In applications using React DnD and drag-and-drop mechanics in React, the parent component re-renders frequently (e.g., when drag state or drop zone state updates). When draggable elements are part of a list, failing to memoize them results in O(n) rendering complexity for every drag/drop interaction.
**Action:** Heavily utilize `React.memo()` on draggable child components rendered in lists to prevent O(n) full re-renders when the parent component or drop zone state changes.
