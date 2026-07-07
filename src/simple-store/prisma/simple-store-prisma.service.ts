import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '../../generated/simple-store';
import { PrismaPg } from '@prisma/adapter-pg';

@Injectable()
export class SimpleStorePrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL manquant dans .env');
    // pg (used under the hood by the adapter) ignores the `?schema=` query
    // param on the connection string, unlike Prisma's own engine, so it must
    // be passed explicitly or every query silently falls back to `public`.
    const schema = new URL(url).searchParams.get('schema') ?? undefined;
    const adapter = new PrismaPg({ connectionString: url }, schema ? { schema } : undefined);
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
