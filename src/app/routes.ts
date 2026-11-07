import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting for heavy pages
// Why: PracticePage and ProgressPage are large components that delay initial load for the Landing Page.
// Impact: Reduces initial JS bundle size and speeds up Time to Interactive (TTI).
// Measurement: Check network tab to see smaller initial chunk and delayed loading of practice/progress chunks.
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