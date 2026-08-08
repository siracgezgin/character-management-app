'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useQueryStates } from 'nuqs';

import type { CharacterFilterInput } from '@/gql/graphql';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { execute } from '@/lib/graphql-client';

import { CharactersQuery } from './queries';
import {
  characterSearchParams,
  characterSearchParamsOptions,
} from './search-params';

const SEARCH_DEBOUNCE_MS = 300;

/**
 * Connects URL state to the server.
 *
 * The flow is: control -> nuqs writes the URL -> the search term is debounced ->
 * the debounced value lands in `queryKey` -> React Query refetches -> the
 * backend filters in PostgreSQL. Nothing is filtered in the browser.
 */
export function useCharacters() {
  const [filters, setFilters] = useQueryStates(
    characterSearchParams,
    characterSearchParamsOptions,
  );

  // Only the free-text input needs debouncing; picking from a dropdown is a
  // deliberate, low-frequency action and should feel immediate.
  const debouncedSearch = useDebouncedValue(filters.search, SEARCH_DEBOUNCE_MS);

  const variables: { filter: CharacterFilterInput } = {
    filter: {
      search: debouncedSearch.trim() || null,
      status: filters.status,
      gender: filters.gender,
    },
  };

  const query = useQuery({
    // Every distinct filter combination is cached under its own key, so
    // revisiting a previous combination is instant.
    queryKey: [
      'characters',
      {
        search: debouncedSearch.trim(),
        status: filters.status,
        gender: filters.gender,
      },
    ],
    queryFn: () => execute(CharactersQuery, variables),
    // React Query v5 replaced `keepPreviousData: true` with this. It keeps the
    // previous results on screen while the next set loads, so changing a filter
    // does not blank the grid.
    placeholderData: keepPreviousData,
  });

  const hasActiveFilters = Boolean(
    filters.search || filters.status || filters.gender,
  );

  const resetFilters = () =>
    setFilters({ search: '', status: null, gender: null });

  return {
    filters,
    setFilters,
    resetFilters,
    hasActiveFilters,
    characters: query.data?.characters ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    // True while showing the previous filter's results during a refetch - used
    // to dim the grid instead of unmounting it.
    isStale: query.isPlaceholderData && query.isFetching,
    // The user has typed something the server has not been asked about yet.
    isTypingAhead: filters.search !== debouncedSearch,
  };
}
