import {
  BadRequestException,
  Logger,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  /**
   * GraphQL already enforces the shape of the input; this pipe adds the
   * `class-validator` constraints on top (notably the search length cap) and
   * rejects any field that is not part of the DTO.
   */
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      // Without this the client only ever sees "Bad Request Exception"; the
      // constraint that actually failed is far more useful to an API consumer.
      exceptionFactory: (errors) =>
        new BadRequestException(
          errors
            .flatMap((error) => Object.values(error.constraints ?? {}))
            .join('; '),
        ),
    }),
  );

  const corsOrigins = (
    configService.get<string>('CORS_ORIGINS') ?? 'http://localhost:3000'
  )
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({ origin: corsOrigins, credentials: true });

  // Ensures Prisma's pool is drained when the process receives SIGTERM/SIGINT.
  app.enableShutdownHooks();

  const port = Number(configService.get<string>('PORT') ?? 4000);
  await app.listen(port);

  Logger.log(
    `GraphQL API ready at http://localhost:${port}/graphql`,
    'Bootstrap',
  );
  Logger.log(`CORS enabled for: ${corsOrigins.join(', ')}`, 'Bootstrap');
}

void bootstrap();
