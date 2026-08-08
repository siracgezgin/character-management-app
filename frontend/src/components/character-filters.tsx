'use client';

import { useId } from 'react';

import {
  GENDER_VALUES,
  STATUS_VALUES,
} from '@/features/characters/search-params';
import type { Gender, Status } from '@/gql/graphql';

const STATUS_LABELS: Record<Status, string> = {
  ALIVE: 'Alive',
  DEAD: 'Dead',
  UNKNOWN: 'Unknown',
};

const GENDER_LABELS: Record<Gender, string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  UNKNOWN: 'Unknown',
};

type CharacterFiltersProps = {
  search: string;
  status: Status | null;
  gender: Gender | null;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: Status | null) => void;
  onGenderChange: (value: Gender | null) => void;
  onReset: () => void;
  hasActiveFilters: boolean;
  resultCount: number;
  isBusy: boolean;
};

const selectClassName =
  'w-full appearance-none rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring/40';

export function CharacterFilters({
  search,
  status,
  gender,
  onSearchChange,
  onStatusChange,
  onGenderChange,
  onReset,
  hasActiveFilters,
  resultCount,
  isBusy,
}: CharacterFiltersProps) {
  // `useId` keeps label/input associations unique and stable across SSR.
  const searchId = useId();
  const statusId = useId();
  const genderId = useId();

  return (
    <section
      aria-label="Filter characters"
      className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm sm:p-5"
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={searchId}
            className="text-xs font-medium tracking-wide text-foreground-muted uppercase"
          >
            Search
          </label>
          <input
            id={searchId}
            type="search"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search name or description..."
            // Mirrors the 100-character cap enforced by the API.
            maxLength={100}
            className="w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-foreground-muted/70 focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={statusId}
            className="text-xs font-medium tracking-wide text-foreground-muted uppercase"
          >
            Status
          </label>
          <select
            id={statusId}
            value={status ?? ''}
            onChange={(event) =>
              onStatusChange((event.target.value || null) as Status | null)
            }
            className={selectClassName}
          >
            <option value="">All statuses</option>
            {STATUS_VALUES.map((value) => (
              <option key={value} value={value}>
                {STATUS_LABELS[value]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor={genderId}
            className="text-xs font-medium tracking-wide text-foreground-muted uppercase"
          >
            Gender
          </label>
          <select
            id={genderId}
            value={gender ?? ''}
            onChange={(event) =>
              onGenderChange((event.target.value || null) as Gender | null)
            }
            className={selectClassName}
          >
            <option value="">All genders</option>
            {GENDER_VALUES.map((value) => (
              <option key={value} value={value}>
                {GENDER_LABELS[value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        {/* aria-live announces the new count after filtering without moving
            focus away from the control the user is operating. */}
        <p
          aria-live="polite"
          aria-busy={isBusy}
          className="text-sm text-foreground-muted"
        >
          {isBusy
            ? 'Searching...'
            : `${resultCount} ${resultCount === 1 ? 'character' : 'characters'} found`}
        </p>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-border-subtle px-3 py-1.5 text-sm font-medium text-foreground transition hover:bg-surface-muted focus-visible:ring-2 focus-visible:ring-ring/40 focus-visible:outline-none"
          >
            Clear filters
          </button>
        )}
      </div>
    </section>
  );
}
