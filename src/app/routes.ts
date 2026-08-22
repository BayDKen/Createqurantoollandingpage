import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Route-level code splitting
// Why: Reduces the initial bundle size by lazily loading route components only when they are navigated to, rather than loading all pages upfront.
// Impact: Improves initial page load time and Time to Interactive (TTI), particularly on slower connections.
// Measurement: Verify reduced initial JavaScript payload size in the Network tab and faster LCP in Lighthouse.
export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      {
        index: true,
        lazy: async () => {
          const { LandingPage } = await import("./components/landing-page");
          return { Component: LandingPage };
        }
      },
      {
        path: "practice",
        lazy: async () => {
          const { PracticePage } = await import("./components/practice-page");
          return { Component: PracticePage };
        }
      },
      {
        path: "progress",
        lazy: async () => {
          const { ProgressPage } = await import("./components/progress-page");
          return { Component: ProgressPage };
        }
      },
    ],
  },
]);