import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting for large pages
// Why: PracticePage and ProgressPage are very large components (over 1000 lines each). Loading them lazily reduces the initial JS bundle size and speeds up the initial page load time.
// Impact: Reduces initial bundle size and improves TTI (Time to Interactive) for the landing page.
// Measurement: Verify in the browser DevTools Network tab that the JS chunks for practice-page and progress-page are only fetched when navigating to their respective routes.

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