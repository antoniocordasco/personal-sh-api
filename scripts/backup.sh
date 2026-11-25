#!/usr/bin/env bash
# Dumps the database to ~/backups and keeps the last 14 days.
# Run on the server, e.g. daily from cron:
#   0 3 * * * ~/personal-sh-api/scripts/backup.sh >> ~/backups/backup.log 2>&1
set -euo pipefail

BACKUP_DIR="$HOME/backups"
mkdir -p "$BACKUP_DIR"
cd "$HOME/personal-sh-api"

FILE="$BACKUP_DIR/personal_sh-$(date +%Y-%m-%d_%H%M).sql.gz"
docker compose exec -T db pg_dump -U personal_sh personal_sh | gzip > "$FILE"
find "$BACKUP_DIR" -name 'personal_sh-*.sql.gz' -mtime +14 -delete
echo "$(date -Is) backup written: $FILE"
