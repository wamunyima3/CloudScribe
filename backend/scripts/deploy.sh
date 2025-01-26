#!/bin/bash

# Exit on error
set -e

# Load environment variables
source .env

echo "Starting deployment..."

# Build and push Docker images
echo "Building and pushing Docker images..."
docker-compose -f docker-compose.yml -f docker-compose.prod.yml build
docker-compose -f docker-compose.yml -f docker-compose.prod.yml push

# Run database migrations
echo "Running database migrations..."
npm run db:migrate

# Deploy to production
echo "Deploying to production..."
docker stack deploy -c docker-compose.yml -c docker-compose.prod.yml cloudscribe

echo "Deployment completed successfully!" 