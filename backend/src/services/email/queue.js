const Bull = require('bull');
const { logger } = require('../../utils/logger');
const emailService = require('./email.service');

// Get the Queue constructor
const Queue = Bull.default || Bull;

// Create email queue
const emailQueue = new Queue('email', process.env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    }
  }
});

// Process email jobs
emailQueue.process(async (job) => {
  const { type, data } = job.data;
  
  try {
    await emailService.send(type, data);
    logger.info(`Email sent successfully: ${type}`, { jobId: job.id });
  } catch (error) {
    logger.error(`Email sending failed: ${type}`, { error, jobId: job.id });
    throw error; // Retry the job
  }
});

// Handle failed jobs
emailQueue.on('failed', (job, err) => {
  logger.error('Email job failed:', {
    jobId: job.id,
    type: job.data.type,
    error: err.message
  });
});

// Monitor queue health
emailQueue.on('error', error => {
  logger.error('Email queue error:', error);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  await emailQueue.close();
});

module.exports = emailQueue; 