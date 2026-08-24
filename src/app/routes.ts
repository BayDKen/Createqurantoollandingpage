import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: Reduces initial bundle size by lazy loading page components only when their routes are visited.
// Impact: Faster initial page load time and smaller main bundle.
// Measurement: Check the network tab in DevTools to verify that separate JS chunks are loaded when navigating to new routes, and compare main bundle size.
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