import { Component, ReactNode } from "react";
import { useNavigate } from "react-router";

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: ReactNode;
}

class ErrorBoundaryClass extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string | null }) {
    console.error("[My Muraja'ah] Error caught by boundary:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center px-6"
          style={{ backgroundColor: "#f7f5f0", fontFamily: "'Inter', sans-serif" }}
        >
          <div className="text-center max-w-md">
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}
            >
              <span className="text-3xl">⚠️</span>
            </div>
            <h1 className="text-2xl mb-3" style={{ color: "#2d3a2e", fontWeight: 700 }}>
              Terjadi Kesalahan
            </h1>
            <p className="text-sm mb-6" style={{ color: "#6b7c6e" }}>
              {this.state.error?.message || "Something went wrong"}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.href = "/";
              }}
              className="px-6 py-3 rounded-xl text-white cursor-pointer"
              style={{ backgroundColor: "#16A34A" }}
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export { ErrorBoundaryClass as ErrorBoundary };