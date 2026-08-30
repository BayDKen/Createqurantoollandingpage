// ⚡ Bolt Optimization: Added route-level code splitting
// Why: Prevent loading all page components in the initial bundle
// Impact: Reduces initial bundle size and improves initial page load performance
// Measurement: Verify bundle size reduction and chunk generation in `pnpm run build` output

import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () =>
          import("./components/landing-page").then((m) => ({
            Component: m.LandingPage,
          })),
      },
      {
        path: "practice",
        lazy: () =>
          import("./components/practice-page").then((m) => ({
            Component: m.PracticePage,
          })),
      },
      {
        path: "progress",
        lazy: () =>
          import("./components/progress-page").then((m) => ({
            Component: m.ProgressPage,
          })),
      },
    ],
  },
]);