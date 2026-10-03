// ⚡ Bolt Optimization: Route-level code splitting
// Why: Reduces initial bundle size by dynamically loading route components only when visited.
// Impact: Faster initial page load and smaller main bundle.
// Measurement: Compare initial JS bundle size in `pnpm run build` output.
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import("./components/landing-page").then((m) => ({ Component: m.LandingPage }))
      },
      {
        path: "practice",
        lazy: () => import("./components/practice-page").then((m) => ({ Component: m.PracticePage }))
      },
      {
        path: "progress",
        lazy: () => import("./components/progress-page").then((m) => ({ Component: m.ProgressPage }))
      },
    ],
  },
]);