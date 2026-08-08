import { PrismaPg } from '@prisma/adapter-pg';
import { Gender, PrismaClient, Status } from '@prisma/client';
import 'dotenv/config';

/**
 * Deterministic seed data.
 *
 * The dataset is intentionally hand-written rather than randomly generated so
 * that every run produces the exact same rows, and so that the filtering and
 * search behaviour can be asserted against known expectations:
 *
 *  - All 9 `status` x `gender` combinations are covered by exactly 3 records,
 *    which makes result counts predictable when reviewing the filters.
 *  - "Sanchez" appears in one character's NAME (Rick Sanchez) and in another
 *    character's DESCRIPTION (Beth Smith). Searching for it must return both,
 *    which proves the server-side OR across name + description.
 *  - Turkish characters are included ("Şirin Yıldız" as a name, "Şirin" inside
 *    another character's description) to exercise case-insensitive matching on
 *    a non-ASCII alphabet - something SQLite cannot do (see ADR-001 in the
 *    README, which also documents the one Unicode case that does not fold).
 */
type CharacterSeed = {
  id: number;
  name: string;
  status: Status;
  gender: Gender;
  description: string;
};

const avatar = (n: number) =>
  `https://rickandmortyapi.com/api/character/avatar/${n}.jpeg`;

const characters: CharacterSeed[] = [
  // --- ALIVE + MALE ---------------------------------------------------------
  {
    id: 1,
    name: 'Rick Sanchez',
    status: Status.ALIVE,
    gender: Gender.MALE,
    description:
      'A genius scientist whose drinking problem is matched only by his contempt for authority. Travels the multiverse with a portal gun of his own design.',
  },
  {
    id: 2,
    name: 'Morty Smith',
    status: Status.ALIVE,
    gender: Gender.MALE,
    description:
      'An anxious teenager dragged across dimensions by his grandfather. Braver than he believes, and far more traumatised than he admits.',
  },
  {
    id: 3,
    name: 'Jerry Smith',
    status: Status.ALIVE,
    gender: Gender.MALE,
    description:
      'A deeply insecure advertising executive who means well and achieves little. Perpetually one bad decision away from disaster.',
  },

  // --- ALIVE + FEMALE -------------------------------------------------------
  {
    id: 4,
    name: 'Beth Smith',
    status: Status.ALIVE,
    gender: Gender.FEMALE,
    // NOTE: "Sanchez" lives here in the description on purpose - it is the
    // proof that text search ORs across name AND description.
    description:
      'A skilled horse surgeon and the daughter of Rick Sanchez. Struggles to reconcile her fathers absence with her own ambitions.',
  },
  {
    id: 5,
    name: 'Summer Smith',
    status: Status.ALIVE,
    gender: Gender.FEMALE,
    description:
      'A sharp, status-conscious teenager who turns out to be remarkably capable once the adventure actually starts.',
  },
  {
    id: 6,
    name: 'Şirin Yıldız',
    status: Status.ALIVE,
    gender: Gender.FEMALE,
    // NOTE: Turkish characters - used to verify case-insensitive search on a
    // non-ASCII alphabet.
    description:
      'İstanbul doğumlu bir biyomühendis. Boğaziçi laboratuvarlarında paralel evrenler üzerine çalışıyor.',
  },

  // --- ALIVE + UNKNOWN ------------------------------------------------------
  {
    id: 7,
    name: 'Cromulon',
    status: Status.ALIVE,
    gender: Gender.UNKNOWN,
    description:
      'A colossal floating head that judges entire planets by their musical performances. Show me what you got.',
  },
  {
    id: 8,
    name: 'Hive Mind Unity',
    status: Status.ALIVE,
    gender: Gender.UNKNOWN,
    description:
      'A collective consciousness capable of assimilating an entire planet. Once had a complicated relationship with a certain scientist.',
  },
  {
    id: 9,
    name: 'Glootie',
    status: Status.ALIVE,
    gender: Gender.UNKNOWN,
    description:
      'A small blue alien app developer with DO NOT DEVELOP MY APP tattooed across its forehead. Nobody ever reads it.',
  },

  // --- DEAD + MALE ----------------------------------------------------------
  {
    id: 10,
    name: 'Abradolf Lincler',
    status: Status.DEAD,
    gender: Gender.MALE,
    description:
      'A failed genetic experiment splicing two historical figures into one deeply confused moral compass.',
  },
  {
    id: 11,
    name: 'Alan Rails',
    status: Status.DEAD,
    gender: Gender.MALE,
    description:
      'Survivor of a train crash that killed his parents, granting him the power to summon ghost trains at will.',
  },
  {
    id: 12,
    name: 'Amish Cyborg',
    status: Status.DEAD,
    gender: Gender.MALE,
    description:
      'A contradiction in terms and a member of a short-lived superhero team. The upgrades did not save him.',
  },

  // --- DEAD + FEMALE --------------------------------------------------------
  {
    id: 13,
    name: 'Tammy Guetermann',
    status: Status.DEAD,
    gender: Gender.FEMALE,
    description:
      'A high-school student revealed to be a deep-cover Galactic Federation agent. Her wedding did not go as planned.',
  },
  {
    id: 14,
    name: 'Supernova',
    status: Status.DEAD,
    gender: Gender.FEMALE,
    description:
      'A former member of the Vindicators who could manipulate stellar matter. Ruthlessly pragmatic about collateral damage.',
  },
  {
    id: 15,
    name: 'Ma-Sha',
    status: Status.DEAD,
    gender: Gender.FEMALE,
    description:
      'A warrior of the Blood Ridge clans who fell defending her territory from an interdimensional incursion.',
  },

  // --- DEAD + UNKNOWN -------------------------------------------------------
  {
    id: 16,
    name: 'Armothy',
    status: Status.DEAD,
    gender: Gender.UNKNOWN,
    description:
      'A reanimated arm stitched onto a torso, briefly the most feared competitor in a death-sport arena.',
  },
  {
    id: 17,
    name: 'Fart',
    status: Status.DEAD,
    gender: Gender.UNKNOWN,
    description:
      'A gaseous entity that communicates telepathically through music and intends to erase all carbon-based life.',
  },
  {
    id: 18,
    name: 'Shrimply Pibbles',
    status: Status.DEAD,
    gender: Gender.UNKNOWN,
    description:
      'An interstellar civil rights leader whose failing heart briefly became the centre of a galactic media circus.',
  },

  // --- UNKNOWN + MALE -------------------------------------------------------
  {
    id: 19,
    name: 'Alien Rick',
    status: Status.UNKNOWN,
    gender: Gender.MALE,
    description:
      'One of countless variants catalogued by the Citadel. Last seen filing paperwork in a dimension nobody visits.',
  },
  {
    id: 20,
    name: 'Antenna Rick',
    status: Status.UNKNOWN,
    gender: Gender.MALE,
    description:
      'A variant distinguished by the receiver protruding from his skull. Whereabouts unconfirmed after the Citadel collapse.',
  },
  {
    id: 21,
    name: 'Aqua Morty',
    status: Status.UNKNOWN,
    gender: Gender.MALE,
    description:
      'An aquatic variant who breathes through gills. Records of him end abruptly and without explanation.',
  },

  // --- UNKNOWN + FEMALE -----------------------------------------------------
  {
    id: 22,
    name: 'Abadango Cluster Princess',
    status: Status.UNKNOWN,
    gender: Gender.FEMALE,
    description:
      'Royalty of the Abadango cluster, courted briefly and disastrously by a member of the Smith household.',
  },
  {
    id: 23,
    name: 'Gwendolyn',
    status: Status.UNKNOWN,
    gender: Gender.FEMALE,
    description:
      'A synthetic companion built to specification, later abandoned in a purpose-built miniature universe.',
  },
  {
    id: 24,
    name: 'Nergis Aydın',
    status: Status.UNKNOWN,
    gender: Gender.FEMALE,
    // NOTE: contains "Şirin" with a capital Ş - searching "şirin" in lowercase
    // must match both this description and the name "Şirin Yıldız" (id 6),
    // which is what proves case-insensitive matching on a non-ASCII alphabet.
    description:
      'Kayıp bir portal mühendisi. Son raporunda Şirin kod adlı deneyden söz ediyor ve ardından izine rastlanmıyor.',
  },

  // --- UNKNOWN + UNKNOWN ----------------------------------------------------
  {
    id: 25,
    name: 'Alien Googah',
    status: Status.UNKNOWN,
    gender: Gender.UNKNOWN,
    description:
      'An enigmatic visitor that appeared during a holiday broadcast and was never satisfactorily explained.',
  },
  {
    id: 26,
    name: 'Zigerion Scammer',
    status: Status.UNKNOWN,
    gender: Gender.UNKNOWN,
    description:
      'A member of a species of con artists who specialise in elaborate simulations to extract valuable recipes.',
  },
  {
    id: 27,
    name: 'Traflorkian',
    status: Status.UNKNOWN,
    gender: Gender.UNKNOWN,
    description:
      'A native of Traflorkia, a planet whose inhabitants are famously difficult to describe and easy to forget.',
  },
];

async function main() {
  // Prefer the direct connection when one is configured: seeding runs many
  // statements in sequence, which a transaction-mode pooler handles poorly.
  const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env before seeding.',
    );
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    console.log(`Seeding ${characters.length} characters...`);

    // `upsert` (rather than `create`) keeps the seeder idempotent: running it
    // repeatedly updates the existing rows instead of failing on the primary
    // key unique constraint.
    for (const character of characters) {
      const { id, ...rest } = character;

      // The portrait is derived from the id rather than repeated on every
      // record, which keeps the dataset above focused on the fields that the
      // filtering and search behaviour actually depends on.
      const data = { ...rest, image: avatar(id) };

      await prisma.character.upsert({
        where: { id },
        update: data,
        create: { id, ...data },
      });
    }

    // Because the rows above are inserted with explicit ids, the SERIAL
    // sequence backing `Character.id` is never advanced. Realigning it means a
    // subsequent `prisma.character.create()` does not collide with seeded rows.
    await prisma.$executeRawUnsafe(
      `SELECT setval(pg_get_serial_sequence('"Character"', 'id'), (SELECT COALESCE(MAX(id), 1) FROM "Character"))`,
    );

    const total = await prisma.character.count();
    console.log(`Seeding complete. ${total} characters in the database.`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
