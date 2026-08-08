import { Injectable } from '@nestjs/common';
import { Character, Prisma } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CharacterFilterInput } from './dto/character-filter.input';

@Injectable()
export class CharactersService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Translates the GraphQL filter input into a Prisma `where` clause.
   *
   * Exposed separately from `findAll` so the composition rules can be unit
   * tested without a database (see characters.service.spec.ts).
   *
   * Semantics:
   *  - `status` and `gender` are exact matches, ANDed together.
   *  - `search` is ORed across `name` and `description`, and that OR group is
   *    then ANDed with the other constraints.
   *  - Absent or blank values contribute no condition at all, so an empty
   *    filter produces `{}` and returns everything.
   */
  buildWhereClause(filter?: CharacterFilterInput): Prisma.CharacterWhereInput {
    const conditions: Prisma.CharacterWhereInput[] = [];

    if (filter?.status) {
      conditions.push({ status: filter.status });
    }

    if (filter?.gender) {
      conditions.push({ gender: filter.gender });
    }

    // A search of only whitespace is treated as no search at all, rather than
    // being sent to the database as a `%   %` pattern that matches everything
    // by accident.
    const search = filter?.search?.trim();

    if (search) {
      conditions.push({
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      });
    }

    // Returning a bare `{}` when nothing is set keeps the generated SQL free of
    // a redundant `AND ()` wrapper.
    return conditions.length > 0 ? { AND: conditions } : {};
  }

  /**
   * Every filter is applied by PostgreSQL. The API never returns an unfiltered
   * set for the client to narrow down itself.
   */
  findAll(filter?: CharacterFilterInput): Promise<Character[]> {
    return this.prisma.character.findMany({
      where: this.buildWhereClause(filter),
      orderBy: { id: 'asc' },
    });
  }
}
