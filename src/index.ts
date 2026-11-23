import { ApolloServer } from '@apollo/server';
import { startStandaloneServer } from '@apollo/server/standalone';
import { GraphQLError } from 'graphql';

import { getUserFromAuthHeader } from './auth.js';
import { config } from './config.js';
import { resolvers, typeDefs, type Context } from './schema.js';

const server = new ApolloServer<Context>({ typeDefs, resolvers });

const { url } = await startStandaloneServer(server, {
  listen: { port: config.port, host: config.host },
  context: async ({ req }) => {
    const hasToken = Boolean(req.headers.authorization);
    console.log(
      `[${new Date().toISOString()}] ${req.method} request from ${req.socket.remoteAddress} (token: ${hasToken ? 'yes' : 'no'})`,
    );
    try {
      return { user: await getUserFromAuthHeader(req.headers.authorization) };
    } catch (err) {
      console.warn(`  ✗ token rejected: ${err instanceof Error ? err.message : String(err)}`);
      throw new GraphQLError('Invalid or expired token', {
        extensions: { code: 'UNAUTHENTICATED', http: { status: 401 } },
      });
    }
  },
});

console.log(`Apollo Server ready at ${url}`);
