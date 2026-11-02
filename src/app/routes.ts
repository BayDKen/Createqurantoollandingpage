import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Lazy load route components
// Why: Prevents loading all route components (like PracticePage and ProgressPage) on the initial load, which reduces the initial bundle size.
// Impact: Faster initial load time and smaller initial JavaScript payload.
// Measurement: Verify bundle splitting in build output (pnpm run build) and smaller initial JS download in network tab.
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
