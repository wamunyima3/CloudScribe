const express = require('express');

const mockDictionaryRouter = express.Router();
mockDictionaryRouter.get('/search', (req, res) => res.json({ success: true }));
mockDictionaryRouter.post('/', (req, res) => res.json({ success: true }));

jest.mock('../../src/api/dictionary/dictionary.routes', () => mockDictionaryRouter); 