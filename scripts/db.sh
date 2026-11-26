#!/usr/bin/env bash
# Connects to the home server's database from the Mac through an SSH tunnel.
# The password is read from the server's .env, so nothing secret is stored here.
#
# Usage: ./scripts/db.sh [studio|psql|tunnel]
#   studio  (default) open Prisma Studio in the browser
#   psql    open a psql shell
#   tunnel  just open the tunnel and print the connection details (for TablePlus, DBeaver, …)
#
# Override the server with SERVER=user@host and the local port with LOCAL_PORT=…
set -euo pipefail

MODE="${1:-studio}"
SERVER="${SERVER:-antonio@192.168.1.108}"
LOCAL_PORT="${LOCAL_PORT:-5433}"
DB_USER="personal_sh"
DB_NAME="personal_sh"

case "$MODE" in
  studio | psql | tunnel) ;;
  *)
    echo "Usage: $0 [studio|psql|tunnel]" >&2
    exit 1
    ;;
esac

if lsof -nP -iTCP:"$LOCAL_PORT" -sTCP:LISTEN >/dev/null 2>&1; then
  echo "Port $LOCAL_PORT is already in use (another tunnel?). Close it or set LOCAL_PORT=…" >&2
  exit 1
fi

echo "→ Reading the database password from $SERVER"
PASSWORD="$(ssh "$SERVER" "grep -E '^POSTGRES_PASSWORD=' ~/personal-sh-api/.env | cut -d= -f2-")"
if [[ -z "$PASSWORD" ]]; then
  echo "No POSTGRES_PASSWORD found in ~/personal-sh-api/.env on $SERVER" >&2
  exit 1
fi

# Open the tunnel in the background, with a control socket so it can be closed cleanly on exit.
SOCKET="$(mktemp -u "${TMPDIR:-/tmp}/personal-sh-db.XXXXXX")"
echo "→ Opening tunnel localhost:$LOCAL_PORT → $SERVER:5432"
ssh -f -N -M -S "$SOCKET" -o ExitOnForwardFailure=yes -L "$LOCAL_PORT:localhost:5432" "$SERVER"
trap 'ssh -S "$SOCKET" -O exit "$SERVER" >/dev/null 2>&1 || true; echo "→ Tunnel closed"' EXIT

URL="postgresql://$DB_USER:$PASSWORD@localhost:$LOCAL_PORT/$DB_NAME"

case "$MODE" in
  studio)
    cd "$(dirname "$0")/.."
    echo "→ Starting Prisma Studio (Ctrl+C to stop)"
    DATABASE_URL="$URL" npx prisma studio
    ;;
  psql)
    if command -v psql >/dev/null; then
      psql "$URL"
    else
      echo "psql isn't installed on this Mac — opening it on the server instead"
      ssh -t "$SERVER" "cd ~/personal-sh-api && docker compose exec db psql -U $DB_USER $DB_NAME"
    fi
    ;;
  tunnel)
    cat <<EOF

Tunnel open. Connection details:
  Host:     localhost
  Port:     $LOCAL_PORT
  User:     $DB_USER
  Password: $PASSWORD
  Database: $DB_NAME
  URL:      $URL

Press Ctrl+C to close the tunnel.
EOF
    # wait until Ctrl+C; the trap closes the tunnel
    while ssh -S "$SOCKET" -O check "$SERVER" >/dev/null 2>&1; do sleep 2; done
    ;;
esac
