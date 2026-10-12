import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Lazy load route components for code splitting
// Why: Directly importing all route components blocks the initial load with code that isn't immediately needed.
// Impact: Reduces initial bundle size, speeding up initial application load time.
// Measurement: Verify with build output that separate chunks are created for each page.

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import("./components/landing-page").then((m) => ({ Component: m.LandingPage })),
      },
      {
        path: "practice",
        lazy: () => import("./components/practice-page").then((m) => ({ Component: m.PracticePage })),
      },
      {
        path: "progress",
        lazy: () => import("./components/progress-page").then((m) => ({ Component: m.ProgressPage })),
      },
    ],
  },
]);