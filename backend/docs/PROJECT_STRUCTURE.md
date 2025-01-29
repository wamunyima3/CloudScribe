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

## Project Structure

### Root Directory
```
backend/
├── docs/          # Project documentation
├── prisma/        # Database schema and migrations
├── scripts/       # Utility and automation scripts
├── src/           # Source code
├── tests/         # Test files
└── config files   # Configuration files
```

### Source Code (`src/`)
```
src/
├── api/           # API modules (auth, dictionary, user)
├── config/        # Configuration files
├── middleware/    # Express middleware
├── services/      # Shared services
└── utils/         # Utility functions
```

### Tests (`tests/`)
```
tests/
├── helpers/       # Test helper functions
├── integration/   # Integration tests
├── mocks/         # Mock services
├── setup/         # Test setup files
└── unit/         # Unit tests by feature
```

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

