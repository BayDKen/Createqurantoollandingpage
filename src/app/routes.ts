import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Add lazy loading to heavy route components
// Why: PracticePage and ProgressPage are large components (~87KB combined) that are not needed on initial load.
// Impact: Reduces initial bundle size and improves initial page load time.
// Measurement: Verify via build output that chunks are split correctly.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
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