import { PrismaPg } from '@prisma/adapter-pg';

import { config } from './config.js';
import { PrismaClient } from './generated/prisma/client.js';

// One shared client for the whole server. Prisma 7 talks to Postgres through the pg driver adapter.
const adapter = new PrismaPg({ connectionString: config.databaseUrl });

export const prisma = new PrismaClient({ adapter });
