## 2024-05-18 - [Optimize DraggableAnswer with React.memo]
**Learning:** Using `React.memo()` on draggable child components rendered in lists is crucial in this project's setup. It successfully prevents O(n) full re-renders when the parent drop zone state changes, without sacrificing code readability.
**Action:** Heavily utilize `React.memo()` within React DnD contexts for list items to avoid performance bottlenecks related to parent state updates.
