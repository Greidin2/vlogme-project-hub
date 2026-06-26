import { Component, type ErrorInfo, type ReactNode } from "react";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error(error, info);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <section className="page-card hub-page-header" aria-labelledby="error-title">
          <h1 id="error-title">Не удалось открыть раздел</h1>
          <p>Не удалось открыть раздел. Обновите страницу или перейдите на главную.</p>
          <a className="hub-action" href="#/">
            Вернуться на главную
          </a>
        </section>
      );
    }

    return this.props.children;
  }
}
