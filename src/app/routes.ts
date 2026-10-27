import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting for main routes
// Why: Large components like PracticePage and ProgressPage were being imported synchronously, bloating the main bundle.
// Impact: Defers loading of route components until navigation, reducing initial JS payload and improving TTI/FCP.
// Measurement: Verify via Network tab that distinct JS chunks are loaded only upon navigating to /practice or /progress.
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