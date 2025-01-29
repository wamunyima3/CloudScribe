#!/bin/bash

# Load environment variables
set -a
source .env.test
set +a

# Drop and recreate test database
echo "Dropping and recreating test database..."
mysql --user=ekum --password=24673832 <<EOF
DROP DATABASE IF EXISTS cloudscribe_test;
CREATE DATABASE cloudscribe_test;
EOF

# Run migrations on test database
echo "Running migrations..."
DATABASE_URL="mysql://ekum:24673832@localhost:3306/cloudscribe_test" \
NODE_ENV=test \
npx prisma migrate deploy

# Generate Prisma client
echo "Generating Prisma client..."
DATABASE_URL="mysql://ekum:24673832@localhost:3306/cloudscribe_test" \
npx prisma generate

echo "Test setup complete!" 