import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Implement route-level code splitting
// Why: Prevent loading all page components in the main bundle, which slows down initial load time.
// Impact: Reduces initial bundle size and speeds up time-to-interactive for the landing page.
// Measurement: Verify with `pnpm run build` that chunking produces separate files for PracticePage and ProgressPage.

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