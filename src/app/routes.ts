import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: PracticePage and ProgressPage are large components. Loading them synchronously increases initial bundle size.
// Impact: Reduces initial load time by deferring the download.
// Measurement: Check network tab for chunked JS loading.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
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