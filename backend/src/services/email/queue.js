const Queue = require('bull');
const { logger } = require('../../utils/logger');
const emailService = require('./email.service');

// Create email queue
const emailQueue = new Queue('email', process.env.REDIS_URL, {
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    removeOnComplete: true
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
emailQueue.on('failed', (job, error) => {
  logger.error('Email job failed', {
    jobId: job.id,
    type: job.data.type,
    attempts: job.attemptsMade,
    error
  });
});

// Monitor queue health
emailQueue.on('error', error => {
  logger.error('Email queue error:', error);
});

module.exports = {
  addToQueue: async (type, data, options = {}) => {
    try {
      const job = await emailQueue.add({ type, data }, options);
      logger.info(`Email job added to queue: ${type}`, { jobId: job.id });
      return job;
    } catch (error) {
      logger.error('Failed to add email job to queue:', error);
      throw error;
    }
  }
}; 