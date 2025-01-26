const nodemailer = require('nodemailer');
const { logger } = require('../../utils/logger');
const templates = require('./templates');
const emailQueue = require('./queue');

class EmailService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    // Verify connection
    this.transporter.verify()
      .then(() => logger.info('SMTP connection established'))
      .catch(error => logger.error('SMTP connection failed:', error));
  }

  async send(type, data) {
    try {
      if (!templates[type]) {
        throw new Error(`Email template '${type}' not found`);
      }

      const { subject, html } = templates[type](data);

      const info = await this.transporter.sendMail({
        from: `"CloudScribe" <${process.env.SMTP_USER}>`,
        to: data.email,
        subject,
        html
      });

      logger.info('Email sent successfully', {
        messageId: info.messageId,
        type,
        recipient: data.email
      });

      return info;
    } catch (error) {
      logger.error('Email sending failed:', error);
      throw error;
    }
  }

  // Queue email for sending
  async queue(type, data, options = {}) {
    return emailQueue.addToQueue(type, data, options);
  }

  // Convenience methods for common emails
  async sendWelcome(user) {
    return this.queue('welcome', user);
  }

  async sendPasswordReset(user) {
    return this.queue('passwordReset', user, { priority: 'high' });
  }

  async sendContributionApproved(user, contribution) {
    return this.queue('contributionApproved', { user, contribution });
  }

  async sendWeeklyDigest(user, stats) {
    return this.queue('weeklyDigest', { user, stats });
  }
}

module.exports = new EmailService(); 