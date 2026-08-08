import { Field, InputType } from '@nestjs/graphql';
import { Gender, Status } from '@prisma/client';
import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * All fields are nullable: an omitted filter means "do not constrain on this
 * dimension", so an empty input returns the full catalogue.
 *
 * Grouping the filters into a dedicated input type (instead of hanging three
 * loose arguments off the query) keeps the schema extensible - adding a
 * `species` filter later is an additive change that existing clients ignore.
 */
@InputType({ description: 'Optional server-side filters for the character list.' })
export class CharacterFilterInput {
  @Field(() => Status, { nullable: true })
  @IsOptional()
  @IsEnum(Status)
  status?: Status;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => String, {
    nullable: true,
    description:
      'Case-insensitive text matched against both the name and the description.',
  })
  @IsOptional()
  @IsString()
  // Bounded so a pathologically long string cannot be pushed into a LIKE
  // pattern. 100 characters is far beyond any realistic search term.
  @MaxLength(100, { message: 'search must be 100 characters or fewer' })
  search?: string;
}
