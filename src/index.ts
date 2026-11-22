import { createServer } from 'node:http';
import { createYoga } from 'graphql-yoga';

import { schema } from './schema.js';

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? '0.0.0.0'; // listen on the LAN so a phone can reach it

const yoga = createYoga({ schema });
const server = createServer(yoga);

server.listen(port, host, () => {
  console.log(`GraphQL server ready at http://localhost:${port}${yoga.graphqlEndpoint}`);
});
