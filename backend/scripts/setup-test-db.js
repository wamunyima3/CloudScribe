const { execSync } = require('child_process');
const { PrismaClient } = require('@prisma/client');

async function setupTestDatabase() {
  try {
    // Create test database
    execSync('mysql -u ekum -p24673832 -e "DROP DATABASE IF EXISTS cloudscribe_test; CREATE DATABASE cloudscribe_test;"');

    // Set DATABASE_URL for prisma
    process.env.DATABASE_URL = "mysql://ekum:24673832@localhost:3306/cloudscribe_test";

    // Run migrations
    execSync('npx prisma migrate deploy');

    console.log('Test database setup completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error setting up test database:', error);
    process.exit(1);
  }
}

setupTestDatabase(); 