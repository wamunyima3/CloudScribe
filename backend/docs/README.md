# CloudScribe Backend

## Overview
CloudScribe is a language learning and cultural preservation platform. This repository contains the backend API service built with Node.js, Express, PostgreSQL, and Redis.

## 📚 Documentation
- [Project Structure](./PROJECT_STRUCTURE.md) - Detailed project organization and setup
- [Architecture](./architecture.md) - System architecture and technical design

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- PostgreSQL
- Redis
- Docker (optional)

### Installation
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Run database migrations
npm run db:migrate

# Seed database
npm run db:seed

# Start development server
npm run dev
```

## 🛠 Development

### Available Scripts
```bash
npm run dev          # Start development server
npm start           # Start production server
npm test           # Run tests
npm run lint       # Run linter
npm run db:migrate # Run database migrations
npm run db:seed    # Seed database
```

### API Documentation
API documentation is available at:
- Development: http://localhost:3000/api-docs
- Production: https://api.cloudscribe.com/api-docs

## 🧪 Testing
```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific tests
npm test -- auth.test.js
```

## 🔒 Security
- JWT-based authentication
- Role-based access control
- Rate limiting
- Input validation
- XSS protection

## 🚀 Deployment

### Using Docker
```bash
# Build image
docker build -t cloudscribe-backend .

# Run container
docker run -p 3000:3000 cloudscribe-backend
```

### Manual Deployment
```bash
# Install dependencies
npm install --production

# Run migrations
npm run db:migrate

# Start server
npm start
```

## 📈 Monitoring
- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- Logging: `logs/` directory

## 🤝 Contributing
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open pull request

## 📝 License
This project is licensed under the MIT License - see the [LICENSE](../LICENSE) file for details.

## 👥 Team
- Project Lead: [Name]
- Core Contributors: [Names]
- Contact: team@cloudscribe.com

## 🙏 Acknowledgments
- [List of major dependencies/tools used]
- [Special thanks to contributors] 