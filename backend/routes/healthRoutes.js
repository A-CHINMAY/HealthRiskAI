const express = require('express');
const healthController = require('../controllers/healthController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

if (!authMiddleware.protect) throw new Error('authMiddleware.protect is undefined');
if (!healthController.submitHealthData) throw new Error('submitHealthData is undefined');
if (!healthController.getUserHealthRecords) throw new Error('getUserHealthRecords is undefined');

router.post('/submit', authMiddleware.protect, healthController.submitHealthData);
router.get('/records', authMiddleware.protect, healthController.getUserHealthRecords);

module.exports = router;
