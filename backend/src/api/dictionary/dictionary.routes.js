const express = require('express');
const DictionaryController = require('./dictionary.controller');
const { validate } = require('../../middleware/validate.middleware');
const { authMiddleware } = require('../../middleware/auth.middleware');
const RBACMiddleware = require('../../middleware/rbac.middleware');
const { Permissions } = require('../../config/permissions');
const { dictionarySchema } = require('./dictionary.validation');

const router = express.Router();

// Public routes
router.get('/search',
  validate(dictionarySchema.searchQuery),
  DictionaryController.searchWords
);

// Protected routes
router.use(authMiddleware);

router.post('/',
  RBACMiddleware.requirePermissions(Permissions.WORD_CREATE),
  validate(dictionarySchema.createWord),
  DictionaryController.addWord
);

router.put('/:id',
  RBACMiddleware.requirePermissions(Permissions.WORD_UPDATE),
  RBACMiddleware.requireOwnership(req => req.word.addedById),
  validate(dictionarySchema.updateWord),
  DictionaryController.updateWord
);

router.delete('/:id',
  RBACMiddleware.requirePermissions(Permissions.WORD_DELETE),
  RBACMiddleware.requireOwnership(req => req.word.addedById),
  DictionaryController.deleteWord
);

router.post('/:id/approve',
  RBACMiddleware.requirePermissions(Permissions.WORD_APPROVE),
  DictionaryController.approveWord
);

module.exports = router; 