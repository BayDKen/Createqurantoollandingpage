## 2024-10-27 - Implement code splitting for React Router v7
**Learning:** React Router v7 supports route-level code splitting using the `lazy` property out-of-the-box. The `PracticePage` and `ProgressPage` are very large (>40KB each), blocking the initial load. Dynamically loading named exports in `lazy` requires `import().then(m => ({ Component: m.ComponentName }))` instead of `lazy(() => import())`.
**Action:** Always check the size of route components and implement lazy loading via React Router's `lazy` route property, taking care to map named exports to the `Component` key.
