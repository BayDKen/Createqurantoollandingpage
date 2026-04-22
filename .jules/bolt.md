## 2026-04-22 - [React DnD Performance]
**Learning:** Wrapping draggable components inside  blocks with  effectively resolves the common O(n) re-rendering performance penalty associated with updating the parent drop-zone's state, typical when dropping an item.
**Action:** Always consider  for draggable child components in lists inside this codebase.
## 2023-10-27 - [React DnD Performance]
**Learning:** Wrapping draggable components inside useDrag blocks with React.memo effectively resolves the common O(n) re-rendering performance penalty associated with updating the parent drop-zone's state, typical when dropping an item.
**Action:** Always consider React.memo for draggable child components in lists inside this codebase.
