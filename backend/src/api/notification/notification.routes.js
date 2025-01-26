const express = require('express');
const NotificationController = require('./notification.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const { notificationSchema } = require('./notification.validation');

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

router.get('/',
  NotificationController.getNotifications
);

router.put('/:id/read',
  NotificationController.markAsRead
);

router.put('/preferences',
  validate(notificationSchema.updatePreferences),
  NotificationController.updatePreferences
);

router.delete('/:id',
  NotificationController.deleteNotification
);

module.exports = router; 