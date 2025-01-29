const express = require('express');
const authRoutes = require('../api/auth/auth.routes');
const dictionaryRoutes = require('../api/dictionary/routes/dictionary.routes');
const userRoutes = require('../api/user/user.routes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/dictionary', dictionaryRoutes);
router.use('/users', userRoutes);

module.exports = router; 