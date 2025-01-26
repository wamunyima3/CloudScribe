const express = require('express');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const { validateWord } = require('../middleware/validate.middleware');
const DictionaryController = require('../controllers/dictionary.controller');
const { RBACMiddleware } = require('../middleware/rbac.middleware');

const router = express.Router();

router.get('/search', DictionaryController.searchWords);
router.post('/', 
  RBACMiddleware.hasPermission('dictionary:create'),
  validateWord,
  DictionaryController.addWord
);
router.put('/:id',
  RBACMiddleware.hasPermission('dictionary:update'),
  validateWord,
  DictionaryController.updateWord
);
router.post('/:id/translations',
  authMiddleware,
  validateTranslation,
  DictionaryController.addTranslation
);
router.delete('/:id',
  RBACMiddleware.hasPermission('dictionary:delete'),
  DictionaryController.deleteWord
);
router.post('/:id/approve',
  RBACMiddleware.hasPermission('dictionary:approve'),
  DictionaryController.approveWord
);

module.exports = router; 