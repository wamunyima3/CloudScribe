const express = require('express');
const authRoutes = require('./auth/auth.routes');
const dictionaryRoutes = require('./dictionary/routes/dictionary.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount routes
router.use('/auth', authRoutes);
router.use('/dictionary', dictionaryRoutes);

module.exports = router; 