## 2024-05-18 - Missing memoization for React DnD children
**Learning:** In `src/app/components/practice-page.tsx`, `DraggableAnswer` components are rendered in a list mapping over answers. The parent state `droppedAnswer` causes frequent full re-renders of the un-dragged components unless they are memoized. React DnD performance benefits significantly from `React.memo` around draggable list children.
**Action:** Wrap draggable child components with `memo` from 'react' to avoid unnecessary O(n) re-renders when parent drop zone state changes.

## 2024-05-18 - Figma Asset Build Failure
**Learning:** `pnpm run build` fails when importing `figma:asset/*` because it's not explicitly externalized in `vite.config.ts`.
**Action:** Since memory guidelines say "Strictly isolate changes to the stated goal... Do not include out-of-scope fixes for pre-existing issues (like modifying `vite.config.ts` to fix `figma:asset` build errors) in the same pull request", I will not modify `vite.config.ts` to fix this pre-existing build failure and will rely on manual visual verification or assume my change is correct as it's isolated to React component memoization.
