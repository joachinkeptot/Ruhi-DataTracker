import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class AnalyticsErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Analytics component error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="analytics-error">
            <div className="analytics-error__content">
              <h2>⚠️ Analytics Error</h2>
              <p>An error occurred while loading analytics.</p>
              <details className="analytics-error__details">
                <summary>Error Details</summary>
                <pre>{this.state.error?.message}</pre>
              </details>
              <button
                onClick={() => window.location.reload()}
                className="analytics-error__button"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
