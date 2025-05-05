const express = require('express');
const { body } = require('express-validator');
const applicationController = require('../controllers/application.controller');
const { protect } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all applications for user
router.get('/', applicationController.getUserApplications);

// Get application details
router.get('/:id', applicationController.getApplication);

// Get application status
router.get('/:id/status', applicationController.getApplicationStatus);

// Create new application
router.post(
  '/',
  [
    body('program').optional(),
    body('department').optional(),
    body('academicYear').optional(),
    body('semester').optional(),
    body('disabilityStatus').optional().isBoolean(),
    body('disabilityType').optional(),
    body('emergencyContactName').optional(),
    body('emergencyContactPhone').optional(),
    body('emergencyContactRelationship').optional(),
    validateRequest,
  ],
  applicationController.createApplication
);

// Update application
router.put(
  '/:id',
  [
    body('program').optional(),
    body('department').optional(),
    body('academicYear').optional(),
    body('semester').optional(),
    body('disabilityStatus').optional().isBoolean(),
    body('disabilityType').optional(),
    body('emergencyContactName').optional(),
    body('emergencyContactPhone').optional(),
    body('emergencyContactRelationship').optional(),
    body('currentStep').optional().isInt(),
    body('completedSteps').optional().isArray(),
    validateRequest,
  ],
  applicationController.updateApplication
);

// Submit application
router.post('/:id/submit', applicationController.submitApplication);

// Add education record
router.post(
  '/:id/education',
  [
    body('institutionName').notEmpty().withMessage('Institution name is required'),
    body('institutionType').notEmpty().withMessage('Institution type is required'),
    body('country').optional(),
    body('city').optional(),
    body('degree').optional(),
    body('fieldOfStudy').optional(),
    body('startDate').optional().isDate().withMessage('Invalid start date format'),
    body('endDate').optional().isDate().withMessage('Invalid end date format'),
    body('isCurrentlyStudying').optional().isBoolean(),
    body('grade').optional(),
    body('description').optional(),
    validateRequest,
  ],
  applicationController.addEducation
);

// Delete application
router.delete('/:id', applicationController.deleteApplication);

module.exports = router;