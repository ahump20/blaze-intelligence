#!/bin/bash
# Backup Monitoring and Health Checks

echo "🔍 Running backup health checks..."

# Check backup success rates
FAILED_BACKUPS=$(aws s3api list-objects-v2 --bucket blaze-intelligence-backups --query 'Contents[?contains(Key, `failed`)]' | jq length)
if [ "$FAILED_BACKUPS" -gt 0 ]; then
  echo "⚠️ Warning: $FAILED_BACKUPS failed backups detected"
  # Send alert
  curl -X POST "$SLACK_WEBHOOK_URL" -H 'Content-type: application/json' --data '{
    "text": "🚨 Backup Alert: '"$FAILED_BACKUPS"' failed backups detected",
    "channel": "#blaze-alerts-critical"
  }'
fi

# Check backup recency
LAST_BACKUP=$(aws s3api list-objects-v2 --bucket blaze-intelligence-backups --query 'sort_by(Contents, &LastModified)[-1].LastModified' --output text)
BACKUP_AGE=$(($(date +%s) - $(date -d "$LAST_BACKUP" +%s)))
if [ "$BACKUP_AGE" -gt 7200 ]; then  # 2 hours
  echo "🚨 Critical: Last backup is $((BACKUP_AGE/3600)) hours old"
  # Send critical alert
fi

# Validate data integrity
echo "🔍 Validating Cardinals analytics data integrity..."
CHECKSUM_CURRENT=$(find data/analytics/ -type f -exec md5sum {} + | md5sum)
CHECKSUM_BACKUP=$(aws s3 cp s3://blaze-intelligence-backups/checksums/analytics.md5 - | md5sum)
if [ "$CHECKSUM_CURRENT" != "$CHECKSUM_BACKUP" ]; then
  echo "⚠️ Data integrity mismatch detected in Cardinals analytics"
fi

echo "✅ Backup monitoring complete"
