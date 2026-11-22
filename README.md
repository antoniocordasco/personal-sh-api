# personal-sh-api

GraphQL back end for the [personal-sh](https://github.com/antoniocordasco/personal-sh) app.
Node.js + TypeScript + [GraphQL Yoga](https://the-guild.dev/graphql/yoga-server).

## Run locally

```bash
npm install
npm run dev          # restarts on file changes
```

Open http://localhost:4000/graphql for the GraphiQL playground and try:

```graphql
{ hello(name: "Antonio") serverTime }
```

## Production

```bash
npm run build
npm start            # runs dist/index.js
```

Config via env vars (see `.env.example`): `PORT` (default 4000), `HOST` (default 0.0.0.0).
