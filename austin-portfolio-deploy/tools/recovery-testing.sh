#!/bin/bash
# Automated Recovery Testing Script

echo "🧪 Starting recovery testing..."

# Test Cardinals Analytics Recovery
echo "Testing Cardinals analytics recovery..."
TEST_ENV="dr-test-$(date +%s)"
aws cloudformation create-stack --stack-name "$TEST_ENV" --template-body file://infrastructure/dr-test-template.yml

# Wait for environment to be ready
aws cloudformation wait stack-create-complete --stack-name "$TEST_ENV"

# Restore latest backup
LATEST_BACKUP=$(aws s3 ls s3://blaze-intelligence-backups/critical/cardinals/ --recursive | sort | tail -n 1 | awk '{print $4}')
aws s3 cp "s3://blaze-intelligence-backups/$LATEST_BACKUP" - | tar -xz -C "/tmp/recovery-test/"

# Run validation tests
cd "/tmp/recovery-test/"
npm test -- --testPathPattern="cardinals.*recovery"

# Clean up test environment
aws cloudformation delete-stack --stack-name "$TEST_ENV"

echo "✅ Recovery testing complete"
