import { Outlet } from "react-router";
import { LanguageProvider } from "./language-context";
import { PracticeProvider } from "./practice-context";
import { AuthProvider } from "./auth-context";
import { ErrorBoundary } from "./error-boundary";

export function RootLayout() {
  return (
    <ErrorBoundary>
      <LanguageProvider>
        <PracticeProvider>
          <AuthProvider>
            <Outlet />
          </AuthProvider>
        </PracticeProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
}