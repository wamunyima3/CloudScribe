module.exports = {
  server: {
    trustProxy: true,
    maxRequestSize: '10mb'
  },
  security: {
    rateLimits: {
      windowMs: 15 * 60 * 1000,
      max: 100
    },
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    }
  },
  cache: {
    ttl: 3600,
    prefix: 'prod:'
  },
  logging: {
    level: 'info',
    format: 'json',
    filename: '/var/log/cloudscribe/app-%DATE%.log'
  }
}; 