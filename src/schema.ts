import { GraphQLError } from 'graphql';

import type { AuthUser } from './auth.js';
import { config } from './config.js';
import { prisma } from './db.js';
import type { User } from './generated/prisma/client.js';

export type Context = {
  user: AuthUser | null;
};

export const typeDefs = /* GraphQL */ `
  type Query {
    hello(name: String): String!
    serverTime: String!
    "The logged-in user (created in the database on first call). Requires a valid Auth0 access token."
    me: User!
  }

  type User {
    "Database id"
    id: ID!
    "Auth0 user id (the token's sub claim)"
    auth0Id: String!
    email: String
    name: String
    "ISO timestamp of when the user first called the API"
    createdAt: String!
  }
`;

function requireUser(ctx: Context): AuthUser {
  if (!ctx.user) {
    console.log('  ✗ rejected: not logged in');
    throw new GraphQLError('You must be logged in', {
      extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
    });
  }
  return ctx.user;
}

// Access tokens for a custom API don't carry email/name, so ask Auth0's /userinfo endpoint
// (works because the app requests the "openid profile email" scopes).
async function fetchAuth0Profile(token: string): Promise<{ email?: string; name?: string }> {
  const res = await fetch(`https://${config.auth0Domain}/userinfo`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    console.warn(`  ! /userinfo returned ${res.status}`);
    return {};
  }
  return (await res.json()) as { email?: string; name?: string };
}

// How long the email/name copied from Auth0 are trusted before being refreshed.
const PROFILE_MAX_AGE_MS = 24 * 60 * 60 * 1000;

function isStale(user: User): boolean {
  return !user.email || Date.now() - user.updatedAt.getTime() > PROFILE_MAX_AGE_MS;
}

/**
 * Finds the user's row, creating it (with their Auth0 profile) the first time they call the API.
 * Auth0 is the source of truth for email/name; our copy is refreshed when it's over a day old.
 */
async function getOrCreateUser(auth: AuthUser): Promise<User> {
  const existing = await prisma.user.findUnique({ where: { auth0Id: auth.sub } });

  if (existing) {
    if (!isStale(existing)) return existing;

    const profile = await fetchAuth0Profile(auth.token);
    if (!profile.email && !profile.name) return existing; // Auth0 unreachable — keep what we have

    const refreshed = await prisma.user.update({
      where: { id: existing.id },
      // always write, so updatedAt moves forward even when nothing changed
      data: { email: profile.email ?? existing.email, name: profile.name ?? existing.name },
    });
    console.log(`  ↻ refreshed profile for user #${refreshed.id}`);
    return refreshed;
  }

  const profile = await fetchAuth0Profile(auth.token);
  const created = await prisma.user.upsert({
    // upsert, not create: two simultaneous first requests must not fail on the unique auth0Id
    where: { auth0Id: auth.sub },
    update: {},
    create: { auth0Id: auth.sub, email: profile.email ?? null, name: profile.name ?? null },
  });
  console.log(`  + created user #${created.id} for ${auth.sub}`);
  return created;
}

export const resolvers = {
  Query: {
    hello: (_parent: unknown, args: { name?: string | null }) =>
      `Hello ${args.name ?? 'world'} from personal-sh-api!`,
    serverTime: () => new Date().toISOString(),

    me: async (_parent: unknown, _args: unknown, ctx: Context) => {
      const auth = requireUser(ctx);
      console.log(`  → me query for ${auth.sub}`);

      const user = await getOrCreateUser(auth);
      console.log(`  ✓ returning user #${user.id} (${user.email ?? user.name ?? 'no profile info'})`);
      return user;
    },
  },

  User: {
    createdAt: (user: User) => user.createdAt.toISOString(),
  },
};
