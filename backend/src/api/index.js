const express = require('express');
const authRoutes = require('./auth/auth.routes');
const dictionaryRoutes = require('./dictionary/dictionary.routes');
const storiesRoutes = require('./stories/stories.routes');
const usersRoutes = require('./users/users.routes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => res.json({ status: 'ok' }));

// Mount routes
router.use('/auth', authRoutes);
router.use('/dictionary', dictionaryRoutes);
router.use('/stories', storiesRoutes);
router.use('/users', usersRoutes);

module.exports = router; 