## 2024-08-20 - Memoizing Draggable DnD Components
**Learning:** In applications heavily utilizing `react-dnd` within mapped lists (like `DraggableAnswer`), parent component state updates during drag operations often trigger O(n) re-renders across all list items. This can be a significant source of CPU overhead and jank.
**Action:** Always wrap list child components using `useDrag` in `React.memo()` (e.g., `const Component = memo(function Component(...) { ... })`) to isolate re-renders solely to the item being actively dragged, as long as props passed to them are stable.
