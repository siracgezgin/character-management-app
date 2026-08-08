/**
 * The non-happy-path views: no matches, and request failure. Both are plain
 * presentational components so the page stays readable.
 */

type EmptyStateProps = {
  onReset: () => void;
  hasActiveFilters: boolean;
};

export function EmptyState({ onReset, hasActiveFilters }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border-strong bg-surface px-6 py-16 text-center">
      <p className="text-base font-semibold text-foreground">
        No characters found
      </p>
      <p className="max-w-md text-sm text-foreground-muted">
        {hasActiveFilters
          ? 'No character matches the current filters. Try a different search term, or clear the filters to see everyone.'
          : 'There are no characters in the database yet. Run the seeder to populate it.'}
      </p>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onReset}
          className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className="flex flex-col items-center justify-center gap-3 rounded-xl border border-status-dead/40 bg-status-dead-bg/40 px-6 py-16 text-center"
    >
      <p className="text-base font-semibold text-foreground">
        Could not load characters
      </p>
      <p className="max-w-md text-sm text-foreground-muted">{message}</p>
      <p className="max-w-md text-xs text-foreground-muted">
        Check that the GraphQL API is running on the URL configured in
        NEXT_PUBLIC_GRAPHQL_URL.
      </p>

      <button
        type="button"
        onClick={onRetry}
        className="mt-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
      >
        Try again
      </button>
    </div>
  );
}
