import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Implement route-level code splitting
// Why: Synchronous imports load all page components in the main bundle, increasing initial load time.
// Impact: Reduces initial bundle size by deferring the loading of non-critical routes until accessed.
// Measurement: Verify reduced main bundle size in build output and faster TTI in performance profiles.

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