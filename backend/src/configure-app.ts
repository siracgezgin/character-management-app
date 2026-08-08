import {
  BadRequestException,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';

/**
 * Applies the settings shared by both entry points: `main.ts` for local
 * development, and `api/index.ts` for the Vercel serverless deployment.
 *
 * Keeping this in one place means the deployed API cannot silently differ from
 * the one that runs locally.
 */
export function configureApp(app: INestApplication): (string | RegExp)[] {
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

  const corsOrigins = resolveCorsOrigins();
  app.enableCors({ origin: corsOrigins, credentials: true });

  return corsOrigins;
}

/**
 * Reads the allowed origins from the environment.
 *
 * Vercel assigns a new URL to every preview deployment, so an exact-match list
 * alone would break previews. When `CORS_ALLOW_VERCEL_PREVIEWS` is enabled, any
 * `*.vercel.app` origin is also accepted - convenient for review deployments,
 * and something to tighten if this ever carried real user data.
 */
function resolveCorsOrigins(): (string | RegExp)[] {
  const configured = (process.env.CORS_ORIGINS ?? 'http://localhost:3000')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const origins: (string | RegExp)[] = [...configured];

  if (process.env.CORS_ALLOW_VERCEL_PREVIEWS === 'true') {
    origins.push(/^https:\/\/[a-z0-9-]+\.vercel\.app$/);
  }

  return origins;
}
