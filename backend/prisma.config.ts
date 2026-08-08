import 'dotenv/config';

import path from 'node:path';
import { defineConfig, env } from 'prisma/config';

/**
 * Prisma 7 moved datasource URLs and the seed command out of `schema.prisma`
 * and `package.json` into this file. Note that Prisma 7 no longer loads `.env`
 * automatically, hence the explicit `dotenv/config` import above.
 */
export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: env('DATABASE_URL'),
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
