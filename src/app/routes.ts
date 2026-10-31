import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-Level Code Splitting
// Why: PracticePage and ProgressPage are large components (>1000 lines). Loading them synchronously blocks initial load.
// Impact: Reduces initial main bundle size and improves Time to Interactive (TTI) for the landing page.
// Measurement: Verify network tab for smaller initial bundle and separate chunks loaded on navigation to /practice and /progress.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "practice", lazy: () => import("./components/practice-page").then(m => ({ Component: m.PracticePage })) },
      { path: "progress", lazy: () => import("./components/progress-page").then(m => ({ Component: m.ProgressPage })) },
    ],
  },
]);