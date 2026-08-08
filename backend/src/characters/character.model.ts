import { Field, Int, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Gender, Status } from '@prisma/client';

/**
 * Prisma emits enums as a frozen object plus a string union type rather than a
 * native TypeScript `enum`. `registerEnumType` accepts that object directly, so
 * the database schema stays the single source of truth for the allowed values -
 * there is no hand-maintained copy of these members to drift out of sync.
 */
registerEnumType(Status, {
  name: 'Status',
  description: 'Whether the character is currently alive.',
});

registerEnumType(Gender, {
  name: 'Gender',
  description: 'The gender of the character.',
});

@ObjectType({ description: 'A character in the catalogue.' })
export class Character {
  @Field(() => Int)
  id!: number;

  @Field(() => String, { description: 'Absolute URL of the portrait image.' })
  image!: string;

  @Field(() => String)
  name!: string;

  @Field(() => Status)
  status!: Status;

  @Field(() => Gender)
  gender!: Gender;

  @Field(() => String)
  description!: string;
}
