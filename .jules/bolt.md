## 2024-05-24 - React Router v7 Lazy Loading
**Learning:** React Router v7 allows route-level code splitting using the `lazy` property directly in the route objects of `createBrowserRouter`. For named exports, it requires mapping the module's exported function to the `Component` key using `.then(m => ({ Component: m.ComponentName }))`.
**Action:** Use this pattern to lazily load route components and reduce the initial JavaScript bundle size.
