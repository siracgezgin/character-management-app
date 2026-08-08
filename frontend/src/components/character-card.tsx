import Image from 'next/image';

import type { CharactersQuery } from '@/gql/graphql';

import { StatusBadge } from './status-badge';

type Character = CharactersQuery['characters'][number];

const GENDER_LABELS: Record<Character['gender'], string> = {
  MALE: 'Male',
  FEMALE: 'Female',
  UNKNOWN: 'Unknown',
};

export function CharacterCard({ character }: { character: Character }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-xl border border-border-subtle bg-surface shadow-sm transition hover:border-border-strong hover:shadow-md">
      <div className="relative aspect-square w-full overflow-hidden bg-surface-muted">
        <Image
          src={character.image}
          alt={`Portrait of ${character.name}`}
          fill
          // Matches the responsive grid below, so the browser downloads an
          // appropriately sized image at each breakpoint.
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
          className="object-cover transition duration-300 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="text-base leading-tight font-semibold text-foreground">
            {character.name}
          </h2>
          <StatusBadge status={character.status} />
        </div>

        <p className="text-sm text-foreground-muted">
          <span className="sr-only">Gender: </span>
          <span aria-hidden="true" className="font-medium">
            Gender:{' '}
          </span>
          {GENDER_LABELS[character.gender]}
        </p>

        {/* Clamped rather than truncated server-side so the full text remains
            searchable and available to assistive technology. */}
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground-muted">
          {character.description}
        </p>
      </div>
    </article>
  );
}
