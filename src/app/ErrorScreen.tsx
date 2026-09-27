import { useRouteError } from 'react-router';

export function ErrorScreen() {
  const error = useRouteError();
  return (
    <main className="screen narrow" role="alert">
      <h1>Something went wrong</h1>
      <p>{error instanceof Error ? error.message : 'An unexpected error happened.'}</p>
      <button className="button" onClick={() => window.location.reload()}>
        Reload
      </button>
    </main>
  );
}
