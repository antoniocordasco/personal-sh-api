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

## Authentication (Auth0)

Requests may send an Auth0 access token as `Authorization: Bearer <token>`.
The token is verified in `src/auth.ts` (signature via the tenant's JWKS, issuer, audience, expiry).
Copy `.env.example` to `.env` and set `AUTH0_DOMAIN` and `AUTH0_AUDIENCE` (the API identifier).

- `hello`, `serverTime` — public
- `me` — requires a valid token; returns the Auth0 user id plus email/name from `/userinfo`

## Home server (Docker)

The API and Postgres run with Docker Compose on the home server. Migrations are applied automatically on start-up.

One-time setup on the server:

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER        # then log out and back in
mkdir -p ~/personal-sh-api && cd ~/personal-sh-api
nano .env                            # see .env.server.example
```

Deploy from the Mac (sends the last commit and rebuilds):

```bash
./scripts/deploy.sh antonio@<server-ip>
```

Useful commands on the server (in `~/personal-sh-api`):

```bash
docker compose ps                    # status
docker compose logs -f api           # live API logs
docker compose restart api
docker compose exec db psql -U personal_sh personal_sh
```

Backups: `scripts/backup.sh` dumps the database to `~/backups` (keeps 14 days). Schedule it daily with `crontab -e`:

```
0 3 * * * ~/personal-sh-api/scripts/backup.sh >> ~/backups/backup.log 2>&1
```
