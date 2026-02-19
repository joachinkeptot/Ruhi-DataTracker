import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class GlobalErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Unhandled application error:", error);
    console.error("Error Info:", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100vh",
            padding: "2rem",
            fontFamily: "inherit",
          }}
        >
          <div
            style={{
              maxWidth: "480px",
              textAlign: "center",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "2rem",
            }}
          >
            <h2 style={{ marginBottom: "0.5rem" }}>Something went wrong</h2>
            <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>
              An unexpected error occurred. Your data is safe — try recovering
              below.
            </p>
            <details style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <summary style={{ cursor: "pointer", color: "#64748b" }}>
                Error details
              </summary>
              <pre
                style={{
                  fontSize: "0.75rem",
                  overflowX: "auto",
                  marginTop: "0.5rem",
                  padding: "0.75rem",
                  background: "#f8fafc",
                  borderRadius: "4px",
                }}
              >
                {this.state.error?.message}
              </pre>
            </details>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center" }}>
              <button
                onClick={() => this.setState({ hasError: false, error: null })}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "6px",
                  border: "1px solid #cbd5e1",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Try again
              </button>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "6px",
                  border: "none",
                  background: "#3b82f6",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                Reload page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
