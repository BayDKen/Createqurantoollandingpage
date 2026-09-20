## 2024-05-24 - Handle figma:asset imports
**Learning:** Vite builds fail when encountering `figma:asset/*` imports if not configured.
**Action:** Always add `/^figma:asset\/.*/` to `build.rollupOptions.external` in `vite.config.ts`.
## 2024-05-24 - React DnD Optimization
**Learning:** Components rendered in a list within a React DnD environment (like `DraggableAnswer`) can trigger O(n) full re-renders when the parent drop zone state changes if they are not memoized.
**Action:** Use `React.memo()` to wrap draggable child components (e.g., `DraggableAnswer = memo(function DraggableAnswer(...)`) to prevent unnecessary re-renders.
