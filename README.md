# Character Management Application

A full-stack character catalogue with **server-side** filtering and search.

- **Backend** — NestJS · GraphQL (code-first) · Prisma · PostgreSQL
- **Frontend** — Next.js (App Router) · GraphQL Codegen · React Query · nuqs

The defining constraint of this project is that **no filtering happens in the
browser**. Every filter and search term is sent to the API as a GraphQL
variable, translated into a Prisma `where` clause, and applied by PostgreSQL.
The client only ever receives rows that already match.

---

## Quick start

**Prerequisites:** Node.js 20+ (built on v22), Docker, npm.

```bash
# 1. Database
docker compose up -d

# 2. Backend  (http://localhost:4000/graphql)
cd backend
cp .env.example .env
npm install
npx prisma migrate dev      # creates the schema
npx prisma db seed          # loads 27 characters
npm run start:dev

# 3. Frontend (http://localhost:3000) - in a second terminal
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open <http://localhost:3000>. Try <http://localhost:3000/?search=Sanchez> to see
a filter restored straight from the URL.

> The generated types and hooks are committed, so the frontend runs without a
> codegen step. Run `npm run codegen` after changing an operation or the schema.

---

## How a filter change travels to the database

```
User types / selects
      │
      ▼
nuqs  ──────────────►  URL updates immediately   ?search=rick&status=ALIVE
      │                (so the address bar is always copy-accurate)
      ▼
useDebouncedValue (300 ms)   ← only the text input is debounced
      │
      ▼
queryKey of the generated hook changes  ['Characters', { filter: {...} }]
      │
      ▼
POST /graphql   query Characters($filter: CharacterFilterInput)
      │
      ▼
CharactersResolver → CharactersService.buildWhereClause()
      │
      ▼
Prisma  ──►  PostgreSQL   ILIKE '%rick%' on a pg_trgm GIN index
      │
      ▼
Only the matching rows are returned, cached, and rendered
```

**Debounce placement.** The debounce sits between the URL and the query key, not
between the input and the URL. Typing therefore updates the address bar on every
keystroke — copying the URL mid-typing gives exactly what is on screen — while
the network still sees a single request once typing pauses. Measured in a real
browser: typing a 7-character term fired **1** GraphQL request.

---

## Filter semantics

`status` and `gender` are exact matches ANDed together. `search` is ORed across
`name` and `description`, and that group is then ANDed with the rest:

```ts
{
  AND: [
    { status: 'ALIVE' },
    { gender: 'MALE' },
    { OR: [
        { name:        { contains: 'smith', mode: 'insensitive' } },
        { description: { contains: 'smith', mode: 'insensitive' } },
      ] },
  ]
}
```

Absent filters contribute no condition at all, so an empty filter returns the
full catalogue. A search of only whitespace is discarded rather than sent as a
`%   %` pattern that would match everything by accident.

---

## Project structure

```
.
├── docker-compose.yml            PostgreSQL 17
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma         Character model, enums, indexes
│   │   ├── migrations/           Includes the pg_trgm extension + GIN indexes
│   │   └── seed.ts               27 deterministic characters, idempotent
│   ├── prisma.config.ts          Datasource URL + seed command (Prisma 7)
│   ├── schema.gql                Generated SDL — committed for the frontend
│   └── src/
│       ├── characters/
│       │   ├── character.model.ts        ObjectType + registerEnumType
│       │   ├── characters.resolver.ts    Transport only
│       │   ├── characters.service.ts     Filter composition (the business logic)
│       │   ├── characters.service.spec.ts
│       │   └── dto/character-filter.input.ts
│       ├── prisma/               Connection lifecycle only
│       └── main.ts               CORS, validation, shutdown hooks
└── frontend/
    ├── codegen.ts                Generates types + hooks from ../backend/schema.gql
    └── src/
        ├── app/                  Server layout + page, client Providers
        ├── components/           Card, filters, skeletons, empty/error states
        ├── features/characters/  characters.graphql, URL contract, data hook
        ├── gql/graphql.ts        Generated types + useCharactersQuery — do not edit
        ├── hooks/
        └── lib/                  Fetcher wired into the generated hooks
```

---

## Commands

### Backend (`cd backend`)

| Command | Description |
| --- | --- |
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Compile to `dist/` |
| `npm test` | Unit tests (filter composition) |
| `npx prisma migrate dev` | Apply migrations |
| `npx prisma db seed` | Seed — safe to re-run |
| `npx prisma studio` | Browse the data |
| `npm run db:reset` | Drop, re-migrate, re-seed |

### Frontend (`cd frontend`)

| Command | Description |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run codegen` | Regenerate types + hooks from the SDL |
| `npm run lint` | ESLint |

---

## Verification

The behaviour below was exercised against the running stack in a real browser
(Chromium via Playwright), not asserted from the code.

| # | Scenario | Result |
| --- | --- | --- |
| 1 | No filters | 27 characters, one request |
| 2 | `status=ALIVE` | 9 returned; URL `?status=ALIVE` |
| 3 | `status=ALIVE` + `gender=FEMALE` | 3 returned (AND) |
| 4 | `search=Sanchez` | Rick Sanchez (name match) **and** Beth Smith (description match) — proves the OR |
| 5 | `search=Smith` + `ALIVE` + `MALE` | Morty Smith, Jerry Smith |
| 6 | `search=şirin` (lowercase) | Matches `Şirin Yıldız` and a description containing `ŞİRİN` |
| 7 | `search=BilinmeyenBirKarakterX` | Empty array; empty state renders, no crash |
| 8 | Reload `?search=Smith&status=ALIVE&gender=MALE` | All three controls restored from the URL |
| 9 | `search="   "` (whitespace) | Treated as no search; all 27 returned |
| 10 | `search` over 100 chars | Rejected: `search must be 100 characters or fewer` |
| 11 | Typing 7 characters | **1** GraphQL request (debounce) |
| 12 | Loading `?status=DEAD` | The server returned **9** rows, not 27 — no client-side filtering |

Test 12 is the direct evidence for the core requirement: with a filter active,
the full dataset never reaches the browser.

```bash
cd backend && npm test     # 12 unit tests covering filter composition
```

---

## Architecture decisions

**ADR-001 — PostgreSQL over SQLite.** Prisma's `mode: 'insensitive'` is not
supported on SQLite, and SQLite's `LIKE` is only case-insensitive for ASCII, so
a search for `şirin` would miss `Şirin`. This was verified rather than assumed:
on PostgreSQL, `%şirin%` and `%ŞİRİN%` both match `Şirin Yıldız` and a
description containing `ŞİRİN`. Trade-off: reviewers need Docker.

**ADR-002 — Code-first GraphQL.** The SDL is generated from decorated
TypeScript classes, so schema and resolvers cannot drift apart. The emitted
`schema.gql` is committed and consumed by the frontend's codegen.

**ADR-003 — Prisma enums registered, not redeclared.** Prisma emits enums as a
const object plus a string union rather than a native TS `enum`.
`registerEnumType` accepts that object directly, so the database stays the
single source of truth and there is no duplicated list to fall out of sync.

**ADR-004 — Codegen generates the hooks, not just the types.** The operation
lives in `characters.graphql`, and codegen emits both the operation types and a
typed `useCharactersQuery` hook (`typescript-react-query`, configured with
`reactQueryVersion: 5`). This repository therefore contains **no hand-written
interface for any GraphQL response and no hand-written query hook**.

The alternative was `client-preset`, which emits `TypedDocumentNode`s and
leaves you to write the hook. It is the leaner, more transport-agnostic option,
but the brief asks for generated "queries **and hooks**", and generated hooks
also remove the last place where a query could drift from its types by hand.
`useCharacters` still exists as a thin wrapper, but only to supply variables
from the URL and adapt the result — it does no fetching of its own.

**ADR-005 — URL as the single source of truth.** Filters live in the URL via
nuqs, so views are shareable and survive a reload. No Redux or Zustand: the
state is either in the URL or in React Query's cache.

**ADR-006 — `placeholderData: keepPreviousData`.** React Query v5 removed the
`keepPreviousData` flag. The replacement keeps the previous results mounted
during a refetch; the grid dims instead of collapsing into skeletons.

**ADR-007 — One repository, two independent projects.** `backend/` and
`frontend/` keep separate dependency trees and TypeScript configs. No monorepo
tooling, which would add build complexity for no benefit at this size — and
avoids the duplicate-nuqs-instance class of bug that workspace hoisting can
cause.

**ADR-008 — `contains` rather than a search engine.** Elasticsearch for one
table would be overengineering. PostgreSQL `ILIKE` backed by pg_trgm GIN
indexes is the right tool at this scale.

**ADR-009 — pg_trgm GIN indexes.** A B-tree cannot serve a leading-wildcard
`ILIKE '%term%'`. The schema declares trigram GIN indexes on `name` and
`description`, so the search is index-backed rather than a sequential scan:

```
Bitmap Heap Scan on "Character"
  Recheck Cond: (name ~~* '%rick%')
  ->  Bitmap Index Scan on "Character_name_idx"
```

**ADR-010 — No pagination.** Not requested, and 27 rows do not warrant it. The
service is nonetheless shaped so `take`/`skip` can be threaded through
`findAll` without restructuring.

---

## Notes on the current library versions

The stack moved during development, and a few things differ from most tutorials:

- **`graphql` is pinned to v16.** v17 is published, but `@nestjs/graphql@13`,
  `@apollo/server@5` and `graphql-request@7` all declare `^16` peers.
- **Prisma 7 removed `url` from `schema.prisma`.** The connection string and
  the seed command now live in `prisma.config.ts`, the client requires an
  explicit driver adapter (`@prisma/adapter-pg`), and `.env` is no longer
  auto-loaded — hence the explicit `dotenv/config` import.
- **The seed command belongs in `prisma.config.ts`**, not the `prisma` key of
  `package.json`, which Prisma 7 ignores.
- **Next.js 16** deprecates `images.domains` in favour of `images.remotePatterns`,
  and requires a Suspense boundary around any component reading
  `useSearchParams()` — which nuqs does internally.
- **NestJS 11 runs on Express 5**, so `@as-integrations/express5` is needed
  alongside `@nestjs/apollo`.

---

## Deliberately not built

Authentication, client-side state libraries, pagination, microservices, and
external search infrastructure. Each is outside the brief and would add
surface area without demonstrating anything the task asks for.
