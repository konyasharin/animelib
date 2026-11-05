import { config } from 'dotenv';
import { defineConfig } from 'prisma/config';

// .env лежит в корне репозитория — один файл на всю монорепу
config({ path: new URL('../../.env', import.meta.url) });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // CLI ходит напрямую: пулеры вроде pgbouncer не умеют DDL,
    // поэтому миграции идут по DIRECT_DATABASE_URL, если он задан
    url: process.env.DIRECT_DATABASE_URL || process.env.DATABASE_URL || '',
  },
});
