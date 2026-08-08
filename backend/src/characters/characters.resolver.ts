import { Args, Query, Resolver } from '@nestjs/graphql';

import { Character } from './character.model';
import { CharactersService } from './characters.service';
import { CharacterFilterInput } from './dto/character-filter.input';

/**
 * Transport layer only: accepts the request, hands the validated input to the
 * service, returns the result. No database access happens here.
 */
@Resolver(() => Character)
export class CharactersResolver {
  constructor(private readonly charactersService: CharactersService) {}

  @Query(() => [Character], {
    name: 'characters',
    description:
      'Returns characters matching the given filter. Filtering and search are performed by the database; omitting the filter returns every character.',
  })
  characters(
    @Args('filter', { type: () => CharacterFilterInput, nullable: true })
    filter?: CharacterFilterInput,
  ): Promise<Character[]> {
    return this.charactersService.findAll(filter);
  }
}
