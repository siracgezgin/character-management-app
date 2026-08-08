import { CharacterCardSkeleton } from './character-card-skeleton';

export const CHARACTER_GRID_CLASSNAME =
  'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

const SKELETON_COUNT = 8;

/**
 * Shared by the React Query loading state and the Suspense fallback that the
 * page needs for prerendering, so both render the identical placeholder grid.
 */
export function CharacterGridSkeleton() {
  return (
    <div
      className={CHARACTER_GRID_CLASSNAME}
      aria-busy="true"
      aria-label="Loading characters"
    >
      {Array.from({ length: SKELETON_COUNT }, (_, index) => (
        <CharacterCardSkeleton key={index} />
      ))}
    </div>
  );
}
