import { loadEnvFile } from 'node:process';
import { defineConfig } from 'prisma/config';

// Load .env for the Prisma CLI (same built-in loader the server uses; no dotenv needed).
try {
  loadEnvFile();
} catch {
  // no .env — rely on real environment variables
}

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
