# personal-sh-api

GraphQL back end for the [personal-sh](https://github.com/antoniocordasco/personal-sh) app.
Node.js + TypeScript + [Apollo Server](https://www.apollographql.com/docs/apollo-server).

## Run locally

```bash
npm install
npm run dev          # restarts on file changes
```

Open http://localhost:4000 for Apollo Sandbox and try:

```graphql
{ hello(name: "Antonio") serverTime }
```

## Production

```bash
npm run build
npm start            # runs dist/index.js
```

Config via env vars (see `.env.example`): `PORT` (default 4000), `HOST` (default 0.0.0.0).
