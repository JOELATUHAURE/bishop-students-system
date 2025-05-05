const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');

const router = express.Router();

// Register user
router.post(
  '/register',
  [
    body('firstName').notEmpty().withMessage('First name is required'),
    body('lastName').notEmpty().withMessage('Last name is required'),
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    body('phone').optional(),
    body('settlementSite').optional(),
    body('preferredLanguage').optional(),
    validateRequest,
  ],
  authController.register
);

// Login user
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('password').notEmpty().withMessage('Password is required'),
    validateRequest,
  ],
  authController.login
);

// Get current user
router.get('/me', protect, authController.getCurrentUser);

// Forgot password
router.post(
  '/forgot-password',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    validateRequest,
  ],
  authController.forgotPassword
);

// Reset password
router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Token is required'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters'),
    validateRequest,
  ],
  authController.resetPassword
);

// Update profile
router.put(
  '/profile',
  protect,
  [
    body('firstName').optional(),
    body('lastName').optional(),
    body('phone').optional(),
    body('gender').optional(),
    body('dateOfBirth').optional().isDate().withMessage('Invalid date format'),
    body('nationality').optional(),
    body('address').optional(),
    body('city').optional(),
    body('state').optional(),
    body('country').optional(),
    body('postalCode').optional(),
    body('preferredLanguage').optional(),
    validateRequest,
  ],
  authController.updateProfile
);

module.exports = router;