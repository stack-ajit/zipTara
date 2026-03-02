const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');

// @route   POST api/auth/register
// @desc    Register user
// @access  Public
router.post('/register', authController.register);

// @route   POST api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', authController.login);

// @route   GET api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', auth, authController.getMe);

// @route   PUT api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', auth, authController.updateProfile);
// @route   PUT api/auth/password
// @desc    Change user password
// @access  Private
router.put('/password', auth, authController.changePassword);

// @route   POST api/auth/google
// @desc    Authenticate user with Google OAuth
// @access  Public
router.post('/google', authController.googleAuth);
router.post('/google-register', authController.googleRegister);

module.exports = router;
