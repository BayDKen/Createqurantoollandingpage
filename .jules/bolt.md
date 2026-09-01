## 2024-05-18 - React Router v7 Code Splitting
**Learning:** React Router v7 supports route-level code splitting out of the box using the `lazy` property on route objects, which can drastically improve initial load time by deferring the loading of non-critical route components. When using named exports, it requires mapping the exported module using `.then(m => ({ Component: m.ComponentName }))`.
**Action:** When working on React Router v7 applications, proactively use the `lazy` property on routes to enable automatic code splitting and reduce main bundle size.
