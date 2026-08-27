import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting using React Router v7 lazy loading
// Why: Reduces initial bundle size by loading route components only when visited
// Impact: Improves Initial Load Time and Time to Interactive
// Measurement: Verify via Network tab that component chunks load on demand
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