import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { join } from 'node:path';

import { CharactersModule } from './characters/characters.module';
import { PrismaModule } from './prisma/prisma.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    /**
     * Code-first: the SDL in `schema.gql` is generated from the decorated
     * TypeScript classes, so the schema can never drift from the resolvers.
     * That file is also what the frontend's GraphQL Codegen reads to produce
     * its types (see frontend/codegen.ts).
     */
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      // Locally the SDL is written to disk so it can be committed and consumed
      // by the frontend's codegen. On Vercel the filesystem is read-only, so
      // `true` builds the same schema in memory instead.
      autoSchemaFile: process.env.VERCEL
        ? true
        : join(process.cwd(), 'schema.gql'),
      sortSchema: true,
      // Apollo's built-in landing page, served at http://localhost:4000/graphql
      playground: false,
      graphiql: true,
    }),

    PrismaModule,
    CharactersModule,
  ],
})
export class AppModule {}
