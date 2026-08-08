import { GraphQLClient, type Variables } from 'graphql-request';

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

const client = new GraphQLClient(endpoint);

/**
 * The transport that GraphQL Codegen wires into every generated hook.
 *
 * The plugin emits `fetcher<TData, TVariables>(document, variables, headers)`
 * and expects a thunk back, which it hands to React Query as the `queryFn`.
 * Centralising it here keeps the endpoint out of the generated file.
 *
 * `document` is typed loosely because the plugin passes a
 * `TypedDocumentString`, which extends `String` and is therefore not
 * assignable to the `string` primitive.
 */
export function fetcher<TData, TVariables extends Variables>(
  document: string | { toString(): string },
  variables?: TVariables,
  requestHeaders?: HeadersInit,
): () => Promise<TData> {
  return () =>
    client.request<TData>({
      document: document.toString(),
      variables,
      requestHeaders: requestHeaders as Record<string, string> | undefined,
    });
}

export { endpoint as graphqlEndpoint };
