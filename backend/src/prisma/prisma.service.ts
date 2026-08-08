import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

/**
 * Owns the database connection lifecycle and nothing else - all query logic
 * lives in the feature services (see `CharactersService`). Binding connect and
 * disconnect to Nest's lifecycle hooks means the pool is opened once at boot
 * and drained cleanly on shutdown.
 *
 * Prisma 7 requires an explicit driver adapter instead of reading the
 * connection string from `schema.prisma`, so the URL is resolved here through
 * `ConfigService`.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    const connectionString = configService.get<string>('DATABASE_URL');

    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Copy backend/.env.example to backend/.env.',
      );
    }

    super({ adapter: new PrismaPg({ connectionString }) });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
    this.logger.log('Connected to the database');
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
    this.logger.log('Disconnected from the database');
  }
}
