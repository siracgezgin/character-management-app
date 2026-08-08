import { parseAsString, parseAsStringLiteral } from 'nuqs';

import type { Gender, Status } from '@/gql/graphql';

/**
 * The allowed values are asserted against the generated GraphQL types below, so
 * if the backend enum ever changes, this file fails to compile rather than
 * silently sending an unsupported value.
 */
export const STATUS_VALUES = ['ALIVE', 'DEAD', 'UNKNOWN'] as const;
export const GENDER_VALUES = ['MALE', 'FEMALE', 'UNKNOWN'] as const;

// Compile-time guard: these must stay in sync with the schema.
const _statusCheck: readonly Status[] = STATUS_VALUES;
const _genderCheck: readonly Gender[] = GENDER_VALUES;
void _statusCheck;
void _genderCheck;

/**
 * A single definition of the URL contract, shared by every component that reads
 * or writes filters. `useQueryStates` uses it directly, which keeps the query
 * keys and the URL in lockstep.
 *
 * `clearOnDefault` drops a parameter from the URL when it returns to its
 * default, so an unfiltered view has a clean `/` URL rather than
 * `?search=&status=&gender=`.
 */
export const characterSearchParams = {
  search: parseAsString.withDefault('').withOptions({ clearOnDefault: true }),
  status: parseAsStringLiteral(STATUS_VALUES).withOptions({
    clearOnDefault: true,
  }),
  gender: parseAsStringLiteral(GENDER_VALUES).withOptions({
    clearOnDefault: true,
  }),
};

/**
 * Shared across all filter controls:
 *  - `history: 'replace'` keeps typing from flooding the back button.
 *  - `shallow: true` (the default) updates the URL without asking the server
 *    for a new RSC payload; React Query owns data fetching here.
 */
export const characterSearchParamsOptions = {
  history: 'replace',
  shallow: true,
} as const;
