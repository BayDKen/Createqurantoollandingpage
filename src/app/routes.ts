// ⚡ Bolt Optimization: Lazy load route components
// Why: PracticePage and ProgressPage are very large and block initial load on the landing page
// Impact: Reduces initial JS bundle size and improves First Contentful Paint
// Measurement: Verify faster initial page load using Lighthouse or Network tab
import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

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