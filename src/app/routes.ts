import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    // ⚡ Bolt Optimization: Code splitting routes
    // Why: Reduces initial bundle size by dynamically loading page components only when navigated to
    // Impact: Faster initial load times, less main-thread blocking
    // Measurement: Verify network tab for separate JS chunks loaded on navigation
    children: [
      { index: true, lazy: () => import("./components/landing-page").then(m => ({ Component: m.LandingPage })) },
      { path: "practice", lazy: () => import("./components/practice-page").then(m => ({ Component: m.PracticePage })) },
      { path: "progress", lazy: () => import("./components/progress-page").then(m => ({ Component: m.ProgressPage })) },
    ],
  },
]);