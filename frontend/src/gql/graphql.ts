/* eslint-disable */
/** Internal type. DO NOT USE DIRECTLY. */
type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
/** Internal type. DO NOT USE DIRECTLY. */
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
/** Optional server-side filters for the character list. */
export type CharacterFilterInput = {
  gender?: Gender | null | undefined;
  /** Case-insensitive text matched against both the name and the description. */
  search?: string | null | undefined;
  status?: Status | null | undefined;
};

/** The gender of the character. */
export type Gender =
  | 'FEMALE'
  | 'MALE'
  | 'UNKNOWN';

/** Whether the character is currently alive. */
export type Status =
  | 'ALIVE'
  | 'DEAD'
  | 'UNKNOWN';

export type CharactersQueryVariables = Exact<{
  filter?: CharacterFilterInput | null | undefined;
}>;


export type CharactersQuery = { characters: Array<{ id: number, name: string, image: string, status: Status, gender: Gender, description: string }> };


export const CharactersDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Characters"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"CharacterFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"characters"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"image"}},{"kind":"Field","name":{"kind":"Name","value":"status"}},{"kind":"Field","name":{"kind":"Name","value":"gender"}},{"kind":"Field","name":{"kind":"Name","value":"description"}}]}}]}}]} as unknown as DocumentNode<CharactersQuery, CharactersQueryVariables>;