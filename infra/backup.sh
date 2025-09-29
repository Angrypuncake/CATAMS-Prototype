#!/bin/bash
set -euo pipefail
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="$SCRIPT_DIR/../project/.env.local"
# Load env file
export $(grep -v '^#' "$ENV_FILE" | xargs)

# Ensure DATABASE_URL has ?sslmode=require
DB_URL="${DATABASE_URL}?sslmode=require"

# Backup filename
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"
FILE="$BACKUP_DIR/backup-$(date +%F-%H%M).dump"

# Run dump
pg_dump --dbname="$DB_URL" -Fc -f "$FILE"

echo "Backup created at $FILE"
