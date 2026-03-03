import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { PracticePage } from "./components/practice-page";
import { ProgressPage } from "./components/progress-page";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "practice", Component: PracticePage },
      { path: "progress", Component: ProgressPage },
    ],
  },
]);