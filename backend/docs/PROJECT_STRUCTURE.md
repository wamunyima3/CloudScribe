# Project Structure Documentation

## Quick Start
1. **Installation**
   ```bash
   git clone <repository-url>
   cd backend
   npm install
   ```

2. **Setup Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configurations
   ```

3. **Database Setup**
   ```bash
   npm run db:migrate
   npm run db:seed
   ```

4. **Run Application**
   ```bash
   npm run dev      # Development
   npm start        # Production
   ```

5. **Run Tests**
   ```bash
   npm test         # Run all tests
   npm run test:coverage  # With coverage
   ```

## Overview
The CloudScribe backend follows a modular, feature-based architecture with clear separation of concerns. This document outlines the project structure and development guidelines.

## Prerequisites
- Node.js (v16+)
- PostgreSQL
- Redis
- Docker (optional)

## Environment Variables
```env
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cloudscribe"

# Redis
REDIS_URL="redis://localhost:6379"

# JWT
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="1d"

# Email
SMTP_HOST="smtp.example.com"
SMTP_PORT=587
SMTP_USER="your-email"
SMTP_PASS="your-password"
```

## Table of Contents
- [Project Structure](#project-structure)
- [Development Guidelines](#development-guidelines)
- [API Design](#api-design)
- [Database](#database)
- [Testing](#testing)
- [Security](#security)
- [Deployment](#deployment)

## Root Directory Structure

backend/
├── docs/ # Project documentation
├── prisma/ # Database schema and migrations
├── scripts/ # Utility and automation scripts
├── src/ # Source code
├── tests/ # Test files
└── config files # Configuration files (e.g., .env, package.json)


## Source Code (`src/`)

### API Modules (`src/api/`)
Feature-based modules, each containing:

api/
├── auth/ # Authentication & Authorization
│ ├── auth.controller.js # Request handlers
│ ├── auth.routes.js # Route definitions
│ ├── auth.service.js # Business logic
│ └── auth.validation.js # Input validation
├── dictionary/ # Dictionary feature module
│ ├── controllers/ # Request handlers
│ ├── routes/ # Route definitions
│ ├── services/ # Business logic
│ └── validation/ # Input validation schemas
└── user/ # User management module
├── controllers/ # User-related controllers
├── routes/ # User route definitions
├── services/ # User business logic
└── validation/ # User input validation



### Core Services (`src/services/`)
Shared services used across modules:

services/
├── auth/ # Authentication services
│ ├── email-verification.service.js
│ ├── oauth.service.js
│ ├── password.service.js
│ └── role.service.js
├── cache/ # Caching functionality
├── email/ # Email handling
├── health/ # Health checks
├── monitoring/ # System monitoring
└── notification/ # Notification handling


### Middleware (`src/middleware/`)
Express middleware functions:

middleware/
├── audit.middleware.js # Audit logging
├── auth.middleware.js # Authentication checks
├── cache.middleware.js # Response caching
├── error.middleware.js # Error handling
├── monitoring.middleware.js # Request monitoring
├── rbac.middleware.js # Role-based access control
├── security.middleware.js # Security measures
└── validate.middleware.js # Request validation


### Utils (`src/utils/`)
Utility functions and helpers:

utils/
├── async.handler.js # Async error handling
├── date.js # Date formatting utilities
├── errors.js # Error classes
├── logger.js # Logging utility
├── pagination.js # Pagination helpers
├── response.js # Response formatting
└── validators.js # Common validators



## Tests (`tests/`)
Test files organized by type:

tests/
├── helpers/ # Test helper functions
├── integration/ # Integration tests
├── mocks/ # Mock services
│ └── services/ # Service mocks
├── setup/ # Test setup files
└── unit/ # Unit tests by feature
├── auth/ # Auth module tests
├── dictionary/ # Dictionary module tests
├── middleware/ # Middleware tests
└── notification/# Notification tests


## Database (`prisma/`)
Database-related files:

prisma/
├── migrations/ # Database migrations
├── schema.prisma # Database schema
├── seed.config.js # Seeding configuration
└── seed.js # Database seeding


## Scripts (`scripts/`)
Utility scripts for various operations:

scripts/
├── backup-db.sh # Database backup
├── deploy.sh # Deployment script
├── manage-logs.sh # Log management
├── migrate.sh # Database migration
├── setup-test-db.js # Test database setup
└── test-setup.sh # Test environment setup


## Configuration Files
Important configuration files in the root directory:
- `package.json`: Project dependencies and scripts
- `.env`: Environment variables
- `docker-compose.yml`: Docker configuration
- `Dockerfile`: Docker build instructions

## Best Practices
1. **Modularity**: Each feature has its own module in `src/api/`
2. **Separation of Concerns**: Controllers, services, and routes are separated
3. **Consistent Structure**: Each module follows the same structure
4. **Centralized Services**: Common services are in `src/services/`
5. **Organized Testing**: Tests mirror the source structure
6. **Clear Documentation**: Each module should have its own README

## Adding New Features
When adding a new feature:
1. Create a new directory in `src/api/`
2. Follow the established module structure
3. Add corresponding test files
4. Update documentation
5. Add necessary service integrations

## Testing Strategy
- Unit tests for individual components
- Integration tests for API endpoints
- Mock external services
- Separate test database
- Automated test setup

## Security Considerations
- Authentication middleware
- Input validation
- Rate limiting
- CORS configuration
- Security headers
- Error handling

## Development Guidelines

### Code Style
- Use ESLint and Prettier for consistent formatting
- Follow JavaScript best practices
- Use meaningful variable and function names
- Write clear comments for complex logic

### Git Workflow
1. **Branching Strategy**
   - `main`: Production-ready code
   - `develop`: Development branch
   - `feature/*`: New features
   - `bugfix/*`: Bug fixes
   - `hotfix/*`: Production fixes

2. **Commit Messages**
   - Use conventional commits format
   - Include ticket/issue numbers
   - Write clear descriptions

### Documentation
1. **API Documentation**
   - Use Swagger/OpenAPI
   - Document all endpoints
   - Include request/response examples

2. **Code Documentation**
   - JSDoc for functions
   - README for each module
   - Update docs with code changes

## API Design

### REST Principles
- Use proper HTTP methods
- Follow resource naming conventions
- Implement proper status codes
- Version the API

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {},
  "timestamp": "2024-01-26T14:51:06.000Z"
}
```

### Error Handling
```json
{
  "success": false,
  "message": "Error description",
  "error": {
    "code": "ERROR_CODE",
    "details": {}
  },
  "timestamp": "2024-01-26T14:51:06.000Z"
}
```

## Database

### Schema Management
- Use Prisma migrations
- Version control migrations
- Document schema changes

### Data Access
- Use Prisma Client
- Implement repository pattern
- Handle transactions properly

### Performance
- Index critical fields
- Optimize queries
- Use connection pooling
- Implement caching

## Testing

### Test Types
1. **Unit Tests**
   - Test individual components
   - Mock dependencies
   - Focus on business logic

2. **Integration Tests**
   - Test API endpoints
   - Test database operations
   - Test service integrations

3. **E2E Tests**
   - Test complete workflows
   - Use real dependencies
   - Test user scenarios

### Test Coverage
- Aim for 80% coverage
- Cover critical paths
- Include edge cases

## Security

### Authentication
- JWT-based authentication
- Refresh token rotation
- Session management

### Authorization
- Role-based access control
- Permission validation
- Resource ownership

### Data Protection
- Input sanitization
- Output encoding
- Data encryption
- Secure headers

## Deployment

### Environments
- Development
- Staging
- Production

### CI/CD Pipeline
1. **Build**
   - Install dependencies
   - Run linting
   - Run tests
   - Build artifacts

2. **Deploy**
   - Database migrations
   - Service deployment
   - Health checks
   - Monitoring setup

### Monitoring
- Error tracking
- Performance monitoring
- Resource utilization
- User analytics

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - User logout

### Dictionary
- `GET /api/dictionary/search` - Search words
- `POST /api/dictionary` - Add new word
- `PUT /api/dictionary/:id` - Update word
- `DELETE /api/dictionary/:id` - Delete word

### User Management
- `GET /api/users/me` - Get current user
- `PUT /api/users/me` - Update user profile
- `GET /api/users` - List users (admin)

## Error Codes
| Code | Description |
|------|-------------|
| AUTH_ERROR | Authentication failed |
| VALIDATION_ERROR | Invalid input data |
| NOT_FOUND | Resource not found |
| FORBIDDEN | Permission denied |
| SERVER_ERROR | Internal server error |

## Troubleshooting

### Common Issues
1. **Database Connection**
   - Check PostgreSQL service is running
   - Verify DATABASE_URL in .env
   - Ensure database exists

2. **Redis Connection**
   - Check Redis service is running
   - Verify REDIS_URL in .env

3. **Authentication Issues**
   - Check JWT_SECRET in .env
   - Verify token expiration
   - Clear browser cookies

### Debugging
- Use `DEBUG=app:*` for detailed logs
- Check `logs/error.log` for errors
- Use Postman for API testing

## Contributing
1. Fork the repository
2. Create feature branch
3. Follow code style guidelines
4. Write tests
5. Submit pull request

## Support
- GitHub Issues
- Documentation Wiki
- Team Contact

