const express = require('express');
const router = express.Router();
const { upgradeToPremium } = require('../controllers/subscriptionController');
const { authMiddleware } = require('../middleware/jwtAuthentiaction'); // Assuming you already have this

router.patch('/upgrade', authMiddleware, upgradeToPremium);

module.exports = router;
