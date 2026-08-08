import { Global, Module } from '@nestjs/common';

import { PrismaService } from './prisma.service';

/**
 * Marked `@Global()` so feature modules can inject `PrismaService` without
 * re-importing this module. With a single shared connection pool that is the
 * intended usage.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
