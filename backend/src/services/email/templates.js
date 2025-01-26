const { formatDate } = require('../../utils/date');

const templates = {
  welcome: (user) => ({
    subject: 'Welcome to CloudScribe!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Welcome to CloudScribe!</h1>
        <p>Hi ${user.username},</p>
        <p>Thank you for joining CloudScribe. We're excited to have you as part of our community!</p>
        <p>To get started, please verify your email address:</p>
        <a href="${process.env.FRONTEND_URL}/verify-email?token=${user.verifyToken}" 
           style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
          Verify Email
        </a>
        <p>This link will expire in 24 hours.</p>
      </div>
    `
  }),

  passwordReset: (user) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Password Reset Request</h1>
        <p>Hi ${user.username},</p>
        <p>You recently requested to reset your password. Click the button below to proceed:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${user.resetToken}" 
           style="display: inline-block; padding: 10px 20px; background-color: #2196F3; color: white; text-decoration: none; border-radius: 5px;">
          Reset Password
        </a>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
      </div>
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
  })
};

module.exports = templates; 