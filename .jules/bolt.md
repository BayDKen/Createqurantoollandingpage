## 2024-03-20 - React Router v7 Native Code Splitting
**Learning:** React Router v7 supports route-level code splitting out of the box using the `lazy` property on route objects. It allows loading components only when the route is visited without needing a separate HOC.
**Action:** Always prefer using the route `lazy` property mapping the dynamically imported module's named component to the `Component` key instead of importing all route components synchronously in large React applications.
