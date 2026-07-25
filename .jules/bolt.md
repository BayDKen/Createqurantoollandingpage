## 2026-07-25 - Optimize DraggableAnswer with React.memo()
**Learning:** Using React DnD triggers re-renders on drop zones and parent states, causing all draggable list items to re-render.
**Action:** Wrap draggable child components rendered in lists with React.memo() to prevent O(n) full re-renders.
