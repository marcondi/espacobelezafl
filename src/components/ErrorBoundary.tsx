import React from 'react';

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  error?: unknown;
};

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(error: unknown): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: unknown) {
    // Keep minimal: shows UI instead of white screen. Avoid logging sensitive data.
    // eslint-disable-next-line no-console
    console.error('App crashed:', error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md text-center space-y-2">
            <h1 className="text-2xl font-semibold">Algo deu errado</h1>
            <p className="text-muted-foreground">
              Recarregue a página. Se continuar, volte uma versão no Histórico.
            </p>
            <button
              className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground"
              onClick={() => window.location.reload()}
            >
              Recarregar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
