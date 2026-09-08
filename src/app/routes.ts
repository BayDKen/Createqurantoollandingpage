// ⚡ Bolt Optimization: Lazy load large route components
// Why: PracticePage and ProgressPage are large components (40kb+ each) that block initial load
// Impact: Reduces initial bundle size and speeds up time-to-interactive for the landing page
// Measurement: Verify network tab for smaller initial JS payload and chunked loading on navigation
import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
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