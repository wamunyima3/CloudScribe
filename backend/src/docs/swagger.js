const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CloudScribe API Documentation',
      version: '1.0.0',
      description: 'API documentation for CloudScribe - Language Learning and Cultural Preservation Platform',
      contact: {
        name: 'API Support',
        email: 'support@cloudscribe.com'
      }
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:3000',
        description: 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    security: [{
      bearerAuth: []
    }]
  },
  apis: ['./src/api/**/*.js', './src/docs/components/*.yaml']
};

module.exports = swaggerJsdoc(options); 