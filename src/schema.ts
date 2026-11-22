import { createSchema } from 'graphql-yoga';

export const schema = createSchema({
  typeDefs: /* GraphQL */ `
    type Query {
      hello(name: String): String!
      serverTime: String!
    }
  `,
  resolvers: {
    Query: {
      hello: (_parent: unknown, args: { name?: string | null }) =>
        `Hello ${args.name ?? 'world'} from personal-sh-api!`,
      serverTime: () => new Date().toISOString(),
    },
  },
});
