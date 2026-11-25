import { Component, type ErrorInfo, type ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

/**
 * Top-level fallback boundary to catch WebGL, WASM, or corrupted-state render failures.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || 'An unexpected rendering error occurred.',
    };
  }

  componentDidCatch(_error: Error, _info: ErrorInfo) {
    // Prevent unhandled crash propagation; recovery actions are shown in fallback UI
  }

  private handleResetStorage = () => {
    try {
      window.localStorage.removeItem('bilal_world_projects_v1');
      window.localStorage.removeItem('bilal_world_character_v1');
      window.localStorage.removeItem('bilal_world_visited_chapters_v1');
    } catch {
      // ignore storage errors
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen w-screen flex-col items-center justify-center bg-[#081018] p-6 text-center text-white">
          <div className="max-w-md rounded-3xl border border-rose-500/30 bg-slate-900/95 p-6 shadow-2xl">
            <div className="font-mono-code text-xs font-bold tracking-widest text-rose-400 uppercase">
              3D Scene Recovery
            </div>
            <h1 className="mt-2 font-display text-xl font-bold text-white">
              Something interrupted the 3D portfolio world
            </h1>
            <p className="mt-2 text-xs text-slate-300">
              Your browser may have lost its WebGL context or encountered invalid saved state.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="cursor-pointer rounded-xl bg-emerald-400 px-4 py-2 text-xs font-bold text-slate-950 transition hover:brightness-110"
              >
                Reload World
              </button>
              <button
                type="button"
                onClick={this.handleResetStorage}
                className="cursor-pointer rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20"
              >
                Reset Saved Data & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
