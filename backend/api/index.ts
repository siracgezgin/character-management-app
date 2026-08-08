import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Vercel serverless entry point.
 *
 * Two details matter here:
 *
 * 1. It imports from `../dist`, i.e. the output of `nest build` (real `tsc`),
 *    not from `../src`. Vercel bundles functions with esbuild, which does not
 *    support `emitDecoratorMetadata` - and NestJS relies on that metadata for
 *    dependency injection. Compiling with `tsc` first sidesteps the problem
 *    entirely, because the metadata is already baked into the JavaScript.
 *
 * 2. The initialised app is cached across invocations. A warm container then
 *    reuses the existing Nest instance and Prisma connection instead of paying
 *    the bootstrap cost on every request.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
type ExpressApp = (req: IncomingMessage, res: ServerResponse) => void;

let cachedApp: ExpressApp | undefined;
let bootstrapPromise: Promise<ExpressApp> | undefined;

async function bootstrap(): Promise<ExpressApp> {
  const express = (await import('express')).default;
  const { NestFactory } = await import('@nestjs/core');
  const { ExpressAdapter } = await import('@nestjs/platform-express');

  const { AppModule } = await import('../dist/app.module.js');
  const { configureApp } = await import('../dist/configure-app.js');

  const expressApp = express();

  const app = await NestFactory.create(
    AppModule,
    new ExpressAdapter(expressApp),
    // Vercel captures stdout anyway; keep the noise down to warnings upward.
    { logger: ['error', 'warn'] },
  );

  configureApp(app);

  // `init()` rather than `listen()`: Vercel owns the HTTP server, this function
  // only needs the configured Express request handler.
  await app.init();

  return expressApp as unknown as ExpressApp;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  if (!cachedApp) {
    // Guarding with the promise means concurrent cold-start requests share a
    // single bootstrap instead of racing to build several Nest instances.
    bootstrapPromise ??= bootstrap();
    cachedApp = await bootstrapPromise;
  }

  cachedApp(req, res);
}
