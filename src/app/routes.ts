import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Lazy load route components
// Why: Prevent loading all page components in the initial bundle
// Impact: Reduces initial bundle size and speeds up initial load time
// Measurement: Measure bundle sizes of index vs chunks in build output

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: () => import("./components/landing-page").then(m => ({ Component: m.LandingPage }))
      },
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