#!/usr/bin/env bash
# Deploys the last commit to the home server and (re)starts it with Docker Compose.
# Usage: ./scripts/deploy.sh antonio@192.168.1.x
# Only committed code is sent — uncommitted changes are NOT deployed.
set -euo pipefail

SERVER="${1:-${SERVER:-}}"
if [[ -z "$SERVER" ]]; then
  echo "Usage: $0 user@server-ip   (or set SERVER=...)" >&2
  exit 1
fi
DIR="personal-sh-api"

cd "$(git rev-parse --show-toplevel)"
if [[ -n "$(git status --porcelain)" ]]; then
  echo "⚠️  You have uncommitted changes — they will NOT be deployed."
fi

echo "→ Sending $(git rev-parse --short HEAD) to $SERVER:~/$DIR"
# replace everything except the server's .env, so deleted files don't linger
ssh "$SERVER" "mkdir -p ~/$DIR && find ~/$DIR -mindepth 1 -maxdepth 1 ! -name .env -exec rm -rf {} +"
git archive --format=tar HEAD | ssh "$SERVER" "tar -x -C ~/$DIR"

echo "→ Building and starting containers"
ssh "$SERVER" "cd ~/$DIR && docker compose up -d --build && docker compose ps"
