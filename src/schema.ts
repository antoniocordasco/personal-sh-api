import { GraphQLError } from 'graphql';

import type { AuthUser } from './auth.js';
import { config } from './config.js';

export type Context = {
  user: AuthUser | null;
};

export const typeDefs = /* GraphQL */ `
  type Query {
    hello(name: String): String!
    serverTime: String!
    "The logged-in user. Requires a valid Auth0 access token."
    me: User!
  }

  type User {
    "Auth0 user id (the token's sub claim)"
    id: String!
    email: String
    name: String
    picture: String
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

export const resolvers = {
  Query: {
    hello: (_parent: unknown, args: { name?: string | null }) =>
      `Hello ${args.name ?? 'world'} from personal-sh-api!`,
    serverTime: () => new Date().toISOString(),

    me: async (_parent: unknown, _args: unknown, ctx: Context) => {
      const user = requireUser(ctx);
      console.log(`  → me query for ${user.sub}`);

      // Access tokens for a custom API don't carry email/name, so ask Auth0's
      // /userinfo endpoint (works because the app requests the "openid profile email" scopes).
      const res = await fetch(`https://${config.auth0Domain}/userinfo`, {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      const profile = res.ok
        ? ((await res.json()) as { email?: string; name?: string; picture?: string })
        : {};

      console.log(`  ✓ returning ${profile.email ?? profile.name ?? '(no profile info)'}`);
      return {
        id: user.sub,
        email: profile.email ?? null,
        name: profile.name ?? null,
        picture: profile.picture ?? null,
      };
    },
  },
};
