import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: Synchronously importing all page components bloats the initial bundle size.
// Impact: Reduces the main bundle size by loading page chunks on demand.
// Measurement: Verify network requests in browser dev tools to see separate JS chunks loaded on navigation.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import('./components/landing-page').then(m => ({ Component: m.LandingPage }))
      },
      {
        path: "practice",
        lazy: () => import('./components/practice-page').then(m => ({ Component: m.PracticePage }))
      },
      {
        path: "progress",
        lazy: () => import('./components/progress-page').then(m => ({ Component: m.ProgressPage }))
      },
    ],
  },
]);