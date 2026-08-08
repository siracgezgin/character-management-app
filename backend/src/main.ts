import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';
import { configureApp } from './configure-app';

/**
 * Entry point for local development and any long-running host.
 * The Vercel serverless deployment uses `api/index.ts` instead.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const corsOrigins = configureApp(app);

  // Ensures Prisma's pool is drained when the process receives SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const port = Number(process.env.PORT ?? 4000);
  await app.listen(port);

  Logger.log(
    `GraphQL API ready at http://localhost:${port}/graphql`,
    'Bootstrap',
  );
  Logger.log(`CORS enabled for: ${corsOrigins.join(', ')}`, 'Bootstrap');
}

void bootstrap();
