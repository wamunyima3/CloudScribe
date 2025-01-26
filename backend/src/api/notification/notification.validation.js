const { z } = require('zod');

const notificationSchema = {
  updatePreferences: z.object({
    notifications: z.object({
      email: z.boolean(),
      push: z.boolean(),
      inApp: z.boolean(),
      types: z.object({
        contributionApproved: z.boolean(),
        newComment: z.boolean(),
        achievementUnlocked: z.boolean(),
        translationSuggested: z.boolean(),
        streakReminder: z.boolean(),
        systemUpdate: z.boolean()
      })
    })
  })
};

module.exports = { notificationSchema }; 