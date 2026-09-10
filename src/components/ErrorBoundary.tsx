import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('hockey_torneos_state_v3');
    } catch (e) {
      // ignore
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-rose-500/20 text-rose-400 rounded-full flex items-center justify-center mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h1 className="text-xl font-bold mb-2">Se produjo un error al cargar la app</h1>
          <p className="text-slate-400 text-xs max-w-sm mb-6">
            {this.state.error?.message || 'Error inesperado. Puedes reiniciar la aplicación para recuperarla.'}
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-5 py-2.5 bg-sky-600 active:bg-sky-700 text-white font-bold rounded-xl text-xs"
            >
              Recargar Página
            </button>
            <button
              onClick={this.handleReset}
              className="px-5 py-2.5 bg-slate-800 active:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs border border-slate-700"
            >
              Restablecer Datos
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
