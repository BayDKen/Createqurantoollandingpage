// ⚡ Bolt Optimization: Route-level code splitting
// Why: Defers loading of large page components until they are actually visited, reducing initial bundle size
// Impact: Faster initial page load and smaller main chunk size
// Measurement: Verify smaller main bundle size in 'pnpm run build' output and faster TTFB in DevTools network tab
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import("./components/landing-page").then(m => ({ Component: m.LandingPage }))
      },
      {
        path: "practice",
        lazy: () => import("./components/practice-page").then(m => ({ Component: m.PracticePage }))
      },
      {
        path: "progress",
        lazy: () => import("./components/progress-page").then(m => ({ Component: m.ProgressPage }))
      },
    ],
  },
]);