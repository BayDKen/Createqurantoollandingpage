import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: Prevent loading entire application bundle on initial load
// Impact: Reduces main bundle size, faster initial page load (FCP, TTI)
// Measurement: Check network tab for smaller initial JS payload and chunk loading on navigation
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