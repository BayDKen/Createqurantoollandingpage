import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Code splitting for route components
// Why: PracticePage and ProgressPage are large components that don't need to be loaded on the initial landing page visit.
// Impact: Reduces the initial JS bundle size, improving load time and initial rendering performance.
// Measurement: Verify with network tab in DevTools that practice-page and progress-page chunks are only loaded when navigating to those routes.

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
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