#!/bin/bash

# Load environment variables
source .env

# Create backup directory if it doesn't exist
BACKUP_DIR="./backups"
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create database backup
echo "Creating database backup..."
docker exec cloudscribe-db mysqldump \
  -u$MYSQL_USER \
  -p$MYSQL_PASSWORD \
  $MYSQL_DATABASE > "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Compress backup
gzip "$BACKUP_DIR/backup_$TIMESTAMP.sql"

# Remove backups older than 7 days
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completed: backup_$TIMESTAMP.sql.gz" 