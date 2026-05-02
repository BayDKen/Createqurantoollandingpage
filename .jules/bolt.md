## 2024-05-02 - React DnD List Re-renders
**Learning:** In this codebase, using React DnD within the `PracticePage` component causes O(n) full re-renders of all draggable child components (`DraggableAnswer`) in lists when the parent drop zone state changes. This is a codebase-specific performance anti-pattern.
**Action:** When using React DnD within this project, heavily utilize `React.memo()` on draggable child components rendered in lists to prevent unnecessary O(n) re-renders when the parent drop zone state changes.
