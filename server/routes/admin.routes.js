const express = require('express');
const { body } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { protect, authorize } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');

const router = express.Router();

// Protect all routes and restrict to admin and reviewer roles
router.use(protect);
router.use(authorize(['admin', 'reviewer']));

// Get all applications
router.get('/applications', adminController.getAllApplications);

// Get application details
router.get('/applications/:id', adminController.getApplicationDetails);

// Review application
router.put(
  '/applications/:id/review',
  [
    body('status')
      .isIn(['under_review', 'approved', 'rejected', 'waitlisted'])
      .withMessage('Invalid status'),
    body('comments').optional(),
    body('rejectionReason').optional(),
    validateRequest,
  ],
  adminController.reviewApplication
);

// Verify document
router.put(
  '/applications/:id/documents/:documentId/verify',
  [
    body('verified').isBoolean().withMessage('Verified must be a boolean'),
    body('comments').optional(),
    validateRequest,
  ],
  adminController.verifyDocument
);

// Get application statistics
router.get('/stats', authorize(['admin']), adminController.getApplicationStats);

// Get audit logs
router.get('/audit-logs', authorize(['admin']), adminController.getAuditLogs);

// Export applications
router.get('/export', authorize(['admin']), adminController.exportApplications);

module.exports = router;