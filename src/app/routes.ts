import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Optimization: Code splitting large route components
// Why: PracticePage and ProgressPage are large components (40KB+ each). Loading them on the initial render of the landing page hurts the Time To Interactive (TTI) by inflating the main bundle size.
// Impact: Reduces the initial JS bundle size by deferring the download and parsing of practice and progress pages until the user navigates to them.
// Measurement: Verify by running `pnpm run build` and observing the generation of separate chunk files for practice-page and progress-page.

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
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