import { Component, type ErrorInfo, type ReactNode } from 'react';

/**
 * Error boundary.
 *
 * Everything in this app is computed on the device from the reader's own birth
 * data, so a single unexpected input — a date the browser parses oddly, a
 * stored profile edited by hand — could otherwise unmount the whole tree and
 * leave a blank page with no way back. This catches that, keeps the shell's
 * escape routes working, and offers the two recovery paths that matter:
 * reload, or clear the local data that caused it.
 */

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // No telemetry by design — the console is the only place this goes.
    console.error('AstroSutra hit an unrecoverable error', error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;

    return (
      <div className="landing" style={{ maxWidth: 680, paddingTop: 80 }}>
        <div className="card card--pad-lg">
          <div className="eyebrow">Something broke</div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.4vw, 2.4rem)', marginBottom: 10 }}>
            This screen could not be drawn
          </h1>
          <p className="small muted" style={{ marginBottom: 18 }}>
            The calculation failed on this device. Your saved charts are still in local storage and were not
            changed. Reloading usually fixes it; if it keeps happening, clear the data and try again.
          </p>

          <div className="row" style={{ gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn" onClick={() => window.location.reload()}>
              Reload the app
            </button>
            <button
              type="button"
              className="btn btn--ghost"
              onClick={() => {
                try {
                  window.localStorage.removeItem('astrosutra.data.v1');
                } catch {
                  /* storage may be unavailable; the reload below still helps */
                }
                window.location.assign('/');
              }}
            >
              Clear local data and restart
            </button>
          </div>

          <details style={{ marginTop: 22 }}>
            <summary className="small muted" style={{ cursor: 'pointer' }}>
              Technical detail
            </summary>
            <pre
              className="tiny"
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 10,
                background: 'rgba(0,0,0,0.35)',
                overflowX: 'auto',
                whiteSpace: 'pre-wrap',
                color: 'var(--muted)',
              }}
            >
              {error.name}: {error.message}
            </pre>
          </details>
        </div>
      </div>
    );
  }
}
