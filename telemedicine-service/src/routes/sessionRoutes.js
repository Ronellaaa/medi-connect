const express = require('express');
const router = express.Router();
const sessionController = require('../controllers/sessionController');

router.post('/sessions', sessionController.createSession);
router.get('/sessions/:sessionId', sessionController.getSession);


module.exports = router;