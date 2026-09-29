import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: Reduces initial bundle size by lazily loading page components only when they are visited.
// Impact: Faster initial page load time and improved Time to Interactive (TTI).
// Measurement: Check network tab for smaller initial JS bundle and additional chunks loaded on navigation.

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, lazy: () => import("./components/landing-page").then(m => ({ Component: m.LandingPage })) },
      { path: "practice", lazy: () => import("./components/practice-page").then(m => ({ Component: m.PracticePage })) },
      { path: "progress", lazy: () => import("./components/progress-page").then(m => ({ Component: m.ProgressPage })) },
    ],
  },
]);