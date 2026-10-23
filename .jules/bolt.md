## 2024-05-13 - [Draggable Components Unnecessary Re-renders]
**Learning:** Found that list items rendering as child draggable elements during state changes in parent drop zones cause heavy O(n) full re-renders without proper memoization.
**Action:** Always utilize React.memo() on list-rendered child components.
