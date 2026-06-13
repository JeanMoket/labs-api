import { config } from 'dotenv';
import { defineConfig, env } from 'prisma/config';

// override: false = dont delete existing variables in process.env
config({ path: '.env.dev', override: false });
config({ path: '.env',     override: false });

// Paths are resolved relative to THIS file's directory (prisma/simple_store/)
export default defineConfig({
  schema: 'schema.prisma',
  migrations: {
    path: 'migrations',
    seed: 'ts-node prisma/simple_store/seed.ts', // run from project root
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
