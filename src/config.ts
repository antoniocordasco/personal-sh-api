import { loadEnvFile } from 'node:process';

// Load .env if present (Node's built-in loader; no dotenv needed).
try {
  loadEnvFile();
} catch {
  // no .env file — fall back to real environment variables / defaults
}

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var ${name} (see .env.example)`);
  return value;
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  host: process.env.HOST ?? '0.0.0.0', // listen on the LAN so a phone can reach it
  auth0Domain: required('AUTH0_DOMAIN'),
  auth0Audience: required('AUTH0_AUDIENCE'),
  databaseUrl: required('DATABASE_URL'),
};
