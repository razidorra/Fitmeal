import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  // Shown once the user clicks "Go home" below the fallback — kept as a plain <a> rather than the
  // router's <Link> so it still works even if the crash happened inside the router itself.
  homeHref?: string;
}

interface State {
  error: Error | null;
}

/**
 * Catches render/lifecycle errors anywhere below it in the tree and shows a friendly fallback
 * instead of a blank white screen. Doesn't catch errors from event handlers, async code, or
 * server-side rendering — those still need their own try/catch (see the `role="alert"` messages
 * throughout the meal-plan and progress features for that pattern).
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('FitMeal crashed:', error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ error: null });
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <section className="text-center py-22.5">
        <h1 className="text-[54px]">Something went wrong.</h1>
        <p>This page hit an unexpected error. You can try again, or head back to the homepage.</p>
        <div className="flex items-center gap-6 mt-6 mb-8.75 justify-center">
          <button type="button" className="primary" onClick={this.handleRetry}>Try again</button>
          <a className="flex items-center gap-2.5 text-ink no-underline font-semibold" href={this.props.homeHref ?? import.meta.env.BASE_URL}>Go home</a>
        </div>
      </section>
    );
  }
}
