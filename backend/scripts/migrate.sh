#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "Starting database migration process..."

# Generate Prisma Client
echo -e "${GREEN}Generating Prisma Client...${NC}"
npx prisma generate

# Run migrations
echo -e "${GREEN}Running database migrations...${NC}"
npx prisma migrate deploy

# Run seed script if --seed flag is provided
if [ "$1" == "--seed" ]; then
  echo -e "${GREEN}Seeding database...${NC}"
  npx prisma db seed
fi

echo -e "${GREEN}Migration completed successfully!${NC}" 