## 2023-10-27 - Memoize Draggable Children in React DnD Lists
**Learning:** Using React DnD in lists often causes O(n) full re-renders when the parent's drop zone state changes during drag operations, leading to sluggish interaction.
**Action:** Always wrap child draggable components rendered in lists with `React.memo()` to prevent unnecessary re-renders of the entire list when only one item is being dragged or hovered.
