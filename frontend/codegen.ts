import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Generates fully typed operations *and* React Query hooks from the backend
 * schema, so nothing about a GraphQL response is hand-written on the client.
 *
 * The schema is the SDL that the backend's code-first setup emits, read from
 * disk rather than over the network, so `npm run codegen` works without a
 * running API server. Point `schema` at http://localhost:4000/graphql instead
 * to introspect a live one.
 */
const config: CodegenConfig = {
  schema: '../backend/schema.gql',
  documents: ['src/**/*.graphql'],
  generates: {
    './src/gql/graphql.ts': {
      plugins: [
        'typescript',
        'typescript-operations',
        'typescript-react-query',
      ],
      config: {
        // Emit `useCharactersQuery` for React Query v5. Without this the
        // plugin targets the v4 API, whose object/positional argument shape
        // and removed `keepPreviousData` flag no longer compile.
        reactQueryVersion: 5,

        // Generated hooks delegate transport to this function, keeping the
        // endpoint out of the generated file.
        fetcher: {
          func: '@/lib/graphql-fetcher#fetcher',
          isReactHook: false,
        },

        // Exposes `useCharactersQuery.getKey(variables)` so cache entries can
        // be addressed from outside the hook when needed.
        exposeQueryKeys: true,
        exposeFetcher: true,

        // String unions rather than TS enums, so the generated values line up
        // with the plain strings nuqs stores in the URL.
        enumsAsTypes: true,

        skipTypename: true,
      },
    },
  },
};

export default config;
