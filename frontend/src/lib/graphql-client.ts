import type { TypedDocumentNode } from '@graphql-typed-document-node/core';
import { GraphQLClient, type Variables } from 'graphql-request';

const endpoint =
  process.env.NEXT_PUBLIC_GRAPHQL_URL ?? 'http://localhost:4000/graphql';

const client = new GraphQLClient(endpoint);

/**
 * Thin wrapper over graphql-request that preserves the types carried by a
 * `TypedDocumentNode`. Because the document knows both its result and its
 * variable types, callers get full inference for free - and passing the wrong
 * variables is a compile error.
 */
export function execute<TResult, TVariables extends Variables>(
  document: TypedDocumentNode<TResult, TVariables>,
  variables: TVariables,
): Promise<TResult> {
  // `request` types its variadic parameter with a conditional that TypeScript
  // cannot evaluate while `TVariables` is still generic. The cast is confined
  // to this one line; every call site remains fully typed by the document.
  return client.request<TResult>(document, variables as Variables);
}

export { endpoint as graphqlEndpoint };
