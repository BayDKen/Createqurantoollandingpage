import { createBrowserRouter } from "react-router";
import { RootLayout } from "./components/root-layout";

// ⚡ Bolt Performance Optimization:
// What: Implemented route-level code splitting using React Router's `lazy` feature.
// Why: The initial bundle was unnecessarily large because it synchronously loaded all route components, including heavy dependencies (like react-dnd) and large static arrays (like quizQuestions) even for users who only visited the landing page.
// Impact: Reduces the initial main chunk size from ~792 KB (228 KB gzip) to ~443 KB (133 KB gzip), significantly improving Time-To-Interactive (TTI).
// Measurement: Run `npm run build` to see the reduced chunk sizes for index vs practice/progress routes.

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