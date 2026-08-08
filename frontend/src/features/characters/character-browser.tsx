'use client';

import { CharacterCard } from '@/components/character-card';
import { CharacterFilters } from '@/components/character-filters';
import {
  CHARACTER_GRID_CLASSNAME,
  CharacterGridSkeleton,
} from '@/components/character-grid-skeleton';
import { EmptyState, ErrorState } from '@/components/states';

import { useCharacters } from './use-characters';

/**
 * The interactive half of the page. Everything here is driven by URL state and
 * React Query; the component renders whatever the API returns and never
 * filters the list itself.
 */
export function CharacterBrowser() {
  const {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    characters,
    isLoading,
    isError,
    error,
    refetch,
    isStale,
    isTypingAhead,
  } = useCharacters();

  return (
    <>
      <div className="mb-6">
        <CharacterFilters
          search={filters.search}
          status={filters.status}
          gender={filters.gender}
          onSearchChange={(search) => setFilters({ search })}
          onStatusChange={(status) => setFilters({ status })}
          onGenderChange={(gender) => setFilters({ gender })}
          onReset={resetFilters}
          hasActiveFilters={hasActiveFilters}
          resultCount={characters.length}
          isBusy={isLoading || isStale || isTypingAhead}
        />
      </div>

      {isError ? (
        <ErrorState
          message={
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred.'
          }
          onRetry={() => void refetch()}
        />
      ) : isLoading ? (
        <CharacterGridSkeleton />
      ) : characters.length === 0 ? (
        <EmptyState onReset={resetFilters} hasActiveFilters={hasActiveFilters} />
      ) : (
        <div
          className={CHARACTER_GRID_CLASSNAME}
          // While the next result set loads, the previous one stays mounted
          // (React Query's placeholderData) and is dimmed rather than replaced
          // by skeletons, which avoids a jarring flash on every keystroke.
          style={{ opacity: isStale ? 0.6 : 1 }}
          aria-busy={isStale}
        >
          {characters.map((character) => (
            <CharacterCard key={character.id} character={character} />
          ))}
        </div>
      )}
    </>
  );
}
