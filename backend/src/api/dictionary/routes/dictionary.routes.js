const express = require('express');
const { authMiddleware } = require('../../../middleware/auth.middleware');
const { validateWord } = require('../../../middleware/validate.middleware');
const DictionaryController = require('../controllers/dictionary.controller');
const RBACMiddleware = require('../../../middleware/rbac.middleware');

const router = express.Router();

// Public routes
router.get('/search', DictionaryController.searchWords);

// Protected routes
router.use(authMiddleware);

router.post('/', 
  validateWord,
  RBACMiddleware.check('dictionary:create'), 
  DictionaryController.addWord
);

router.put('/:id',
  validateWord,
  RBACMiddleware.check('dictionary:update'),
  DictionaryController.updateWord
);

router.delete('/:id',
  RBACMiddleware.check('dictionary:delete'),
  DictionaryController.deleteWord
);

module.exports = router; 