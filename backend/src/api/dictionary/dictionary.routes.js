const express = require('express');
const { authMiddleware, roleCheck } = require('../../middleware/auth.middleware');
const { validate } = require('../../middleware/validate.middleware');
const DictionaryController = require('./dictionary.controller');
const { wordSchema, translationSchema } = require('./dictionary.validation');

const router = express.Router();

router.get('/search', DictionaryController.searchWords);

router.post('/', 
  authMiddleware, 
  roleCheck('CONTRIBUTOR', 'CURATOR', 'ADMIN'),
  validate(wordSchema),
  DictionaryController.addWord
);

router.put('/:id',
  authMiddleware,
  roleCheck('CURATOR', 'ADMIN'),
  validate(wordSchema),
  DictionaryController.updateWord
);

router.post('/:id/translations',
  authMiddleware,
  validate(translationSchema),
  DictionaryController.addTranslation
);

module.exports = router; 