const express = require('express');
const { authMiddleware, roleCheck } = require('../middleware/auth.middleware');
const { validateWord } = require('../middleware/validate.middleware');
const DictionaryController = require('../controllers/dictionary.controller');

const router = express.Router();

router.get('/search', DictionaryController.searchWords);
router.post('/', 
  authMiddleware, 
  roleCheck('CONTRIBUTOR', 'CURATOR', 'ADMIN'),
  validateWord,
  DictionaryController.addWord
);
router.put('/:id',
  authMiddleware,
  roleCheck('CURATOR', 'ADMIN'),
  validateWord,
  DictionaryController.updateWord
);
router.post('/:id/translations',
  authMiddleware,
  validateTranslation,
  DictionaryController.addTranslation
);

module.exports = router; 