#!/usr/bin/env bash
# Run once on Hostinger (SSH) to create persistent data folders outside the deploy directory.
# Then set HUDDLEUP_DATA_DIR and HUDDLEUP_UPLOADS_DIR in the Hostinger Node.js app env vars.

set -euo pipefail

BASE="${1:-$HOME/domains/huddleup.wtf/private}"
DATA="$BASE/huddleup-data"
UPLOADS="$BASE/huddleup-uploads"

mkdir -p "$DATA" "$UPLOADS"
chmod 700 "$BASE" "$DATA" "$UPLOADS"

# Migrate existing data from a previous in-app .data folder if present
APP_ROOT="${2:-$HOME/domains/huddleup.wtf/nodejs}"
if [ -f "$APP_ROOT/.data/db.json" ] && [ ! -f "$DATA/db.json" ]; then
  cp "$APP_ROOT/.data/db.json" "$DATA/db.json"
  [ -f "$APP_ROOT/.data/db.json.bak" ] && cp "$APP_ROOT/.data/db.json.bak" "$DATA/db.json.bak"
  echo "Migrated database to $DATA"
fi

echo "Persistent directories ready:"
echo "  HUDDLEUP_DATA_DIR=$DATA"
echo "  HUDDLEUP_UPLOADS_DIR=$UPLOADS"
echo ""
echo "Add those as environment variables in Hostinger → Node.js app → Environment."
