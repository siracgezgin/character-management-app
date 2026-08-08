import type { CodegenConfig } from '@graphql-codegen/cli';

/**
 * Reads the SDL that the backend's code-first setup emits, so `npm run codegen`
 * works without a running API server. Point `schema` at
 * http://localhost:4000/graphql instead if you prefer introspecting a live one.
 *
 * The `client` preset produces a typed `graphql()` function returning
 * `TypedDocumentNode`s. Result and variable types are then inferred at the call
 * site, which is why this project contains no hand-written interfaces for any
 * GraphQL response.
 */
const config: CodegenConfig = {
  schema: '../backend/schema.gql',
  documents: ['src/**/*.{ts,tsx}', '!src/gql/**/*'],
  ignoreNoDocuments: true,
  generates: {
    './src/gql/': {
      preset: 'client',
      config: {
        // Emit the enums as string unions rather than TS enums so the generated
        // values line up with the plain strings held in the URL by nuqs.
        enumsAsTypes: true,
      },
    },
  },
};

export default config;
