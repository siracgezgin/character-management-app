import { DocumentTypeDecoration } from '@graphql-typed-document-node/core';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { fetcher } from '@/lib/graphql-fetcher';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
};

/** A character in the catalogue. */
export type Character = {
  description: Scalars['String']['output'];
  gender: Gender;
  id: Scalars['Int']['output'];
  /** Absolute URL of the portrait image. */
  image: Scalars['String']['output'];
  name: Scalars['String']['output'];
  status: Status;
};

/** Optional server-side filters for the character list. */
export type CharacterFilterInput = {
  gender?: InputMaybe<Gender>;
  /** Case-insensitive text matched against both the name and the description. */
  search?: InputMaybe<Scalars['String']['input']>;
  status?: InputMaybe<Status>;
};

/** The gender of the character. */
export type Gender =
  | 'FEMALE'
  | 'MALE'
  | 'UNKNOWN';

export type Query = {
  /** Returns characters matching the given filter. Filtering and search are performed by the database; omitting the filter returns every character. */
  characters: Array<Character>;
};


export type QueryCharactersArgs = {
  filter?: InputMaybe<CharacterFilterInput>;
};

/** Whether the character is currently alive. */
export type Status =
  | 'ALIVE'
  | 'DEAD'
  | 'UNKNOWN';

export type CharactersQueryVariables = Exact<{
  filter?: InputMaybe<CharacterFilterInput>;
}>;


export type CharactersQuery = { characters: Array<{ id: number, name: string, image: string, status: Status, gender: Gender, description: string }> };


export class TypedDocumentString<TResult, TVariables>
  extends String
  implements DocumentTypeDecoration<TResult, TVariables>
{
  __apiType?: NonNullable<DocumentTypeDecoration<TResult, TVariables>['__apiType']>;
  private value: string;
  public __meta__?: Record<string, any> | undefined;

  constructor(value: string, __meta__?: Record<string, any> | undefined) {
    super(value);
    this.value = value;
    this.__meta__ = __meta__;
  }

  override toString(): string & DocumentTypeDecoration<TResult, TVariables> {
    return this.value;
  }
}

export const CharactersDocument = new TypedDocumentString(`
    query Characters($filter: CharacterFilterInput) {
  characters(filter: $filter) {
    id
    name
    image
    status
    gender
    description
  }
}
    `);

export const useCharactersQuery = <
      TData = CharactersQuery,
      TError = unknown
    >(
      variables?: CharactersQueryVariables,
      options?: Omit<UseQueryOptions<CharactersQuery, TError, TData>, 'queryKey'> & { queryKey?: UseQueryOptions<CharactersQuery, TError, TData>['queryKey'] }
    ) => {
    
    return useQuery<CharactersQuery, TError, TData>(
      {
    queryKey: variables === undefined ? ['Characters'] : ['Characters', variables],
    queryFn: fetcher<CharactersQuery, CharactersQueryVariables>(CharactersDocument, variables),
    ...options
  }
    )};

useCharactersQuery.getKey = (variables?: CharactersQueryVariables) => variables === undefined ? ['Characters'] : ['Characters', variables];


useCharactersQuery.fetcher = (variables?: CharactersQueryVariables, options?: RequestInit['headers']) => fetcher<CharactersQuery, CharactersQueryVariables>(CharactersDocument, variables, options);
