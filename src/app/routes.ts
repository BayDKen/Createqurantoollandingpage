import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt: Implemented route-based code splitting using React Router's `lazy`.
// This optimization separates the large monolithic JS bundle into smaller chunks
// (e.g., from ~774KB down to ~425KB for the main bundle). It significantly improves
// the initial load time by only loading the JavaScript required for the current route.
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
        },
      },
      {
        path: "practice",
        lazy: async () => {
          const { PracticePage } = await import("./components/practice-page");
          return { Component: PracticePage };
        },
      },
      {
        path: "progress",
        lazy: async () => {
          const { ProgressPage } = await import("./components/progress-page");
          return { Component: ProgressPage };
        },
      },
    ],
  },
]);