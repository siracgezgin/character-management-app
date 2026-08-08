import 'dotenv/config';

import path from 'node:path';
import { defineConfig } from 'prisma/config';

/**
 * Prisma 7 moved datasource URLs and the seed command out of `schema.prisma`
 * and `package.json` into this file. Note that Prisma 7 no longer loads `.env`
 * automatically, hence the explicit `dotenv/config` import above.
 *
 * Migrations and seeding must use a *direct* connection. Connection poolers
 * such as Supabase's pgbouncer (port 6543) cannot run the DDL and advisory
 * locks that Prisma Migrate depends on, so `DIRECT_URL` takes precedence here
 * when present, while the application itself runs on the pooled `DATABASE_URL`.
 */
const migrationUrl = process.env.DIRECT_URL ?? process.env.DATABASE_URL;

if (!migrationUrl) {
  throw new Error(
    'Neither DIRECT_URL nor DATABASE_URL is set. Copy .env.example to .env.',
  );
}

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  datasource: {
    url: migrationUrl,
  },
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
