import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-Level Code Splitting
// Why: Reduces the initial bundle size by deferring the load of large page components until they are navigated to.
// Impact: Faster initial load time, particularly for users landing on the home page without immediately needing Practice or Progress features.
// Measurement: Measure bundle size reductions in Vite build output and initial load speeds via Lighthouse.

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