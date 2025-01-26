const { formatDate } = require('../../utils/date');
const baseUrl = process.env.BASE_URL;

const templates = {
  welcome: (username) => ({
    subject: 'Welcome to our platform!',
    html: `
      <h1>Welcome ${username}!</h1>
      <p>We're excited to have you on board.</p>
      <p>Get started by exploring our features:</p>
      <ul>
        <li><a href="${baseUrl}/profile">Complete your profile</a></li>
        <li><a href="${baseUrl}/explore">Explore content</a></li>
        <li><a href="${baseUrl}/settings">Customize your settings</a></li>
      </ul>
    `
  }),

  passwordReset: (token) => ({
    subject: 'Password Reset Request',
    html: `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${baseUrl}/reset-password/${token}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `
  }),

  contributionApproved: (user, contribution) => ({
    subject: 'Your Contribution Was Approved!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Contribution Approved</h1>
        <p>Hi ${user.username},</p>
        <p>Great news! Your ${contribution.type.toLowerCase()} has been approved:</p>
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <h3>${contribution.title || contribution.original}</h3>
          <p>${contribution.content || contribution.translation}</p>
        </div>
        <p>Thank you for helping preserve and share knowledge!</p>
      </div>
    `
  }),

  weeklyDigest: (user, stats) => ({
    subject: 'Your Weekly CloudScribe Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Weekly Update</h1>
        <p>Hi ${user.username},</p>
        <p>Here's your activity summary for the week of ${formatDate(stats.startDate)}:</p>
        <ul>
          <li>Contributions: ${stats.contributions}</li>
          <li>Points earned: ${stats.pointsEarned}</li>
          <li>Current streak: ${stats.streak} days</li>
          <li>New achievements: ${stats.newAchievements.length}</li>
        </ul>
        <a href="${process.env.FRONTEND_URL}/profile" 
           style="display: inline-block; padding: 10px 20px; background-color: #9C27B0; color: white; text-decoration: none; border-radius: 5px;">
          View Full Stats
        </a>
      </div>
    `
  }),

  emailVerification: (token) => ({
    subject: 'Verify your email address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${baseUrl}/verify-email/${token}">Verify Email</a>
      <p>This link will expire in 24 hours.</p>
    `
  })
};

module.exports = templates; 