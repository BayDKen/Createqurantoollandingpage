## 2024-05-18 - Route-level Code Splitting with React Router v7
**Learning:** React Router v7's `lazy` property allows for native route-level code splitting without requiring `React.lazy` or explicit `Suspense` boundaries on the route objects. When using named exports, you must explicitly map the dynamic import resolution to the `Component` property using `.then(m => ({ Component: m.ComponentName }))`.
**Action:** Use this pattern to reduce the initial bundle size for heavily routed applications.
