import { Suspense } from 'react';

import { CharacterGridSkeleton } from '@/components/character-grid-skeleton';
import { CharacterBrowser } from '@/features/characters/character-browser';

/**
 * A Server Component: the static shell is rendered on the server, and only the
 * interactive browser below is shipped as a Client Component.
 *
 * The Suspense boundary is required rather than cosmetic - nuqs reads the query
 * string through `useSearchParams()`, which opts the subtree out of static
 * prerendering and must therefore be wrapped.
 */
export default function HomePage() {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Character Catalogue
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-foreground-muted">
          Filtering and search run entirely on the server. Every change is
          reflected in the URL, so any view can be bookmarked or shared.
        </p>
      </header>

      <Suspense fallback={<CharacterGridSkeleton />}>
        <CharacterBrowser />
      </Suspense>
    </main>
  );
}
