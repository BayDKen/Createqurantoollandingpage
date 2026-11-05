// ⚡ Bolt Optimization: Code split route components
// Why: Reduces initial bundle size by loading Practice and Progress pages only when visited.
// Impact: Smaller initial JS payload, faster time-to-interactive on landing page.
// Measurement: Check network tab for separate chunks on route navigation, or observe build output for multiple chunks.

import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

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
