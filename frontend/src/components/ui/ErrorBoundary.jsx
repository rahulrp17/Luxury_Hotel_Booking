import { Component } from "react";
import Icon from "./Icons";

/**
 * Error boundary. Catches render errors in its subtree and shows a fallback UI
 * (or a custom `fallback` render-prop) with a "Try again" reset.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught an error:", error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) return this.props.children;

    if (this.props.fallback) {
      return this.props.fallback({
        error: this.state.error,
        reset: this.handleReset,
      });
    }

    return (
      <div
        role="alert"
        className="flex flex-col items-center justify-center rounded-2xl border border-brand-100 bg-white p-8 text-center"
      >
        <Icon name="info" size={28} className="mb-3 text-gold-500" />
        <h2 className="font-serif text-lg font-semibold text-brand-900">Something went wrong</h2>
        <p className="mt-1 max-w-sm text-sm text-brand-500">
          {this.state.error?.message || "An unexpected error occurred."}
        </p>
        <button type="button" onClick={this.handleReset} className="btn-primary mt-5">
          Try again
        </button>
      </div>
    );
  }
}

export default ErrorBoundary;