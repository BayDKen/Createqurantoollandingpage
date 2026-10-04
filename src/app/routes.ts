import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level Code Splitting
// Why: The application bundles all page components into the initial load, increasing TTI (Time to Interactive).
// Impact: Reduces the initial JavaScript bundle size significantly by lazily loading the landing, practice, and progress pages only when their routes are accessed.
// Measurement: Run `pnpm run build` and compare the size of the initial entry chunk (`index.js`).

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