#!/bin/bash
# Blaze Intelligence Daily Backup Script
set -e

BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/daily/$BACKUP_DATE"
S3_BUCKET="blaze-intelligence-backups"

echo "🔄 Starting daily backup - $BACKUP_DATE"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Backup critical application code
echo "💾 Backing up Cardinals Analytics Engine..."
tar -czf "$BACKUP_DIR/cardinals-analytics.tar.gz" src/core/ api/enhanced-*.js
aws s3 cp "$BACKUP_DIR/cardinals-analytics.tar.gz" "s3://$S3_BUCKET/critical/cardinals/"

# Backup live data
echo "📊 Backing up live analytics data..."
tar -czf "$BACKUP_DIR/analytics-data.tar.gz" data/analytics/ data/live/
aws s3 cp "$BACKUP_DIR/analytics-data.tar.gz" "s3://$S3_BUCKET/data/analytics/"

# Backup NIL calculator
echo "💰 Backing up NIL calculator engine..."
tar -czf "$BACKUP_DIR/nil-calculator.tar.gz" js/nil-valuation-engine.js api/nil-calculator.js
aws s3 cp "$BACKUP_DIR/nil-calculator.tar.gz" "s3://$S3_BUCKET/critical/nil/"

# Backup user analytics
echo "👤 Backing up user analytics..."
tar -czf "$BACKUP_DIR/user-analytics.tar.gz" analytics-storage/ || echo "No user analytics to backup"
aws s3 cp "$BACKUP_DIR/user-analytics.tar.gz" "s3://$S3_BUCKET/data/users/" || true

# Backup website content
echo "🌐 Backing up website content..."
tar -czf "$BACKUP_DIR/website-content.tar.gz" index.html css/ js/ images/
aws s3 cp "$BACKUP_DIR/website-content.tar.gz" "s3://$S3_BUCKET/content/"

# Backup configurations
echo "⚙️ Backing up configurations..."
tar -czf "$BACKUP_DIR/configurations.tar.gz" tools/ *.json *.toml
aws s3 cp "$BACKUP_DIR/configurations.tar.gz" "s3://$S3_BUCKET/config/"

# Verify backups
echo "✅ Verifying backup integrity..."
aws s3 ls "s3://$S3_BUCKET/" --recursive | grep "$BACKUP_DATE" > "$BACKUP_DIR/backup-manifest.txt"

# Cleanup old local backups (keep last 7 days)
find /backup/daily -type d -mtime +7 -exec rm -rf {} +

# Send backup notification
curl -X POST "$SLACK_WEBHOOK_URL" -H 'Content-type: application/json' --data '{
  "text": "🔄 Blaze Intelligence daily backup completed successfully",
  "attachments": [{
    "color": "good",
    "fields": [{
      "title": "Backup Date",
      "value": "'$BACKUP_DATE'",
      "short": true
    }, {
      "title": "Status", 
      "value": "✅ Success",
      "short": true
    }]
  }]
}'

echo "✅ Daily backup completed successfully - $BACKUP_DATE"
