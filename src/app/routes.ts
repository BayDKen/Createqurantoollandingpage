import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: PracticePage and ProgressPage are large components (1200+ and 1000+ lines respectively) with heavy UI logic. Statically importing them bundles them into the initial load payload.
// Impact: Reduces the initial JS bundle size significantly by lazy loading route components only when visited.
// Measurement: Compare chunk sizes and First Load JS in standard vite build output.

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