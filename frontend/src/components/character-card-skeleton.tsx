/**
 * Mirrors the real card's layout so the grid does not shift when data arrives.
 * The list that renders these carries `aria-busy`, so screen readers announce
 * the pending state rather than reading placeholder boxes.
 */
export function CharacterCardSkeleton() {
  return (
    <div
      className="flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-square w-full animate-pulse bg-surface-muted" />

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="h-4 w-2/3 animate-pulse rounded bg-surface-muted" />
          <div className="h-5 w-14 animate-pulse rounded-full bg-surface-muted" />
        </div>
        <div className="h-3 w-1/3 animate-pulse rounded bg-surface-muted" />
        <div className="space-y-2">
          <div className="h-3 w-full animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-11/12 animate-pulse rounded bg-surface-muted" />
          <div className="h-3 w-4/6 animate-pulse rounded bg-surface-muted" />
        </div>
      </div>
    </div>
  );
}
