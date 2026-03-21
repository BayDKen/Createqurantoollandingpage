import React, { Suspense } from "react";
import { createBrowserRouter } from "react-router";
import { LandingPage } from "./components/landing-page";
import { RootLayout } from "./components/root-layout";

// Lazy load large routes to reduce initial bundle size
const PracticePage = React.lazy(() => import("./components/practice-page").then(m => ({ default: m.PracticePage })));
const ProgressPage = React.lazy(() => import("./components/progress-page").then(m => ({ default: m.ProgressPage })));

// A simple fallback component for Suspense
const LoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f7f5f0] dark:bg-[#1C1917]">
    <div className="w-8 h-8 border-2 border-[rgba(45,58,46,0.12)] dark:border-[#33302e] border-t-[#16A34A] dark:border-t-[#16A34A] rounded-full animate-spin" />
  </div>
);

// Helper to wrap lazy components
const withSuspense = (Component: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    Component: RootLayout,
    children: [
      { index: true, Component: LandingPage },
      { path: "practice", Component: () => withSuspense(PracticePage) },
      { path: "progress", Component: () => withSuspense(ProgressPage) },
    ],
  },
]);