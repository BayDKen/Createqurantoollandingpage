import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Added route-level code splitting
// Why: Reduces initial bundle size by lazy loading pages only when requested
// Impact: Faster initial load time and smaller main bundle
// Measurement: Verify via Network tab that component bundles are loaded dynamically
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