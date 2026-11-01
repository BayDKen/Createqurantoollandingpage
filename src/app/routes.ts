import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Lazy load route components using React Router v7's `lazy` property
// Why: Prevent loading all page components upfront in the main bundle, reducing initial load time
// Impact: Reduces initial JavaScript bundle size, improving Time to Interactive
// Measurement: Verify bundle size reduction in Vite build output and faster initial load in browser network tab

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