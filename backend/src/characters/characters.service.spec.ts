import { Test, TestingModule } from '@nestjs/testing';
import { Gender, Status } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { CharactersService } from './characters.service';

/**
 * These tests exercise the filter composition rules, which are the part of the
 * backend most likely to break silently. Prisma is mocked because the concern
 * here is the shape of the `where` clause, not the database round trip.
 */
describe('CharactersService', () => {
  let service: CharactersService;
  let findMany: jest.Mock;

  beforeEach(async () => {
    findMany = jest.fn().mockResolvedValue([]);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CharactersService,
        { provide: PrismaService, useValue: { character: { findMany } } },
      ],
    }).compile();

    service = module.get(CharactersService);
  });

  describe('buildWhereClause', () => {
    it('returns an empty clause when no filter is supplied', () => {
      expect(service.buildWhereClause()).toEqual({});
      expect(service.buildWhereClause({})).toEqual({});
    });

    it('matches status exactly', () => {
      expect(service.buildWhereClause({ status: Status.ALIVE })).toEqual({
        AND: [{ status: Status.ALIVE }],
      });
    });

    it('matches gender exactly', () => {
      expect(service.buildWhereClause({ gender: Gender.FEMALE })).toEqual({
        AND: [{ gender: Gender.FEMALE }],
      });
    });

    it('ANDs status and gender together', () => {
      expect(
        service.buildWhereClause({
          status: Status.DEAD,
          gender: Gender.FEMALE,
        }),
      ).toEqual({
        AND: [{ status: Status.DEAD }, { gender: Gender.FEMALE }],
      });
    });

    it('ORs the search term across name and description, case-insensitively', () => {
      expect(service.buildWhereClause({ search: 'Sanchez' })).toEqual({
        AND: [
          {
            OR: [
              { name: { contains: 'Sanchez', mode: 'insensitive' } },
              { description: { contains: 'Sanchez', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });

    it('nests the search OR group inside the top-level AND', () => {
      const where = service.buildWhereClause({
        status: Status.ALIVE,
        gender: Gender.MALE,
        search: 'Smith',
      });

      expect(where).toEqual({
        AND: [
          { status: Status.ALIVE },
          { gender: Gender.MALE },
          {
            OR: [
              { name: { contains: 'Smith', mode: 'insensitive' } },
              { description: { contains: 'Smith', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });

    it('trims surrounding whitespace from the search term', () => {
      expect(service.buildWhereClause({ search: '  Morty  ' })).toEqual({
        AND: [
          {
            OR: [
              { name: { contains: 'Morty', mode: 'insensitive' } },
              { description: { contains: 'Morty', mode: 'insensitive' } },
            ],
          },
        ],
      });
    });

    it.each([['', 'empty string'], ['   ', 'whitespace only']])(
      'ignores a search of %p (%s) instead of matching everything',
      (search) => {
        expect(service.buildWhereClause({ search })).toEqual({});
      },
    );

    it('keeps other filters when the search term is blank', () => {
      expect(
        service.buildWhereClause({ status: Status.UNKNOWN, search: '  ' }),
      ).toEqual({ AND: [{ status: Status.UNKNOWN }] });
    });
  });

  describe('findAll', () => {
    it('delegates the composed clause to Prisma with a stable ordering', async () => {
      await service.findAll({ status: Status.ALIVE });

      expect(findMany).toHaveBeenCalledWith({
        where: { AND: [{ status: Status.ALIVE }] },
        orderBy: { id: 'asc' },
      });
    });

    it('queries with an empty clause when unfiltered', async () => {
      await service.findAll();

      expect(findMany).toHaveBeenCalledWith({
        where: {},
        orderBy: { id: 'asc' },
      });
    });
  });
});
