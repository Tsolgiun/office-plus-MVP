const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth.middleware');
const { register, login, getProfile,getAIresponse } = require('../controllers/auth.controller');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.get('/getAIresponse',auth,getAIresponse)
// Protected routes
router.get('/profile', auth, getProfile);

module.exports = router;
