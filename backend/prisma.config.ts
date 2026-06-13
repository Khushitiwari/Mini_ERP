import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'backendprisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node src/seed/seed.js',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
});
