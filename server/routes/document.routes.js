const express = require('express');
const { body } = require('express-validator');
const documentController = require('../controllers/document.controller');
const { protect } = require('../middlewares/auth');
const { validateRequest } = require('../middlewares/validate');

const router = express.Router();

// Protect all routes
router.use(protect);

// Get all documents for an application
router.get('/:id', documentController.getDocuments);

// Get a single document
router.get('/:id/:documentId', documentController.getDocument);

// Upload document
router.post(
  '/:id',
  [
    body('name').notEmpty().withMessage('Document name is required'),
    body('type').notEmpty().withMessage('Document type is required'),
    body('institution').optional(),
    validateRequest,
  ],
  documentController.uploadFile,
  documentController.uploadDocument
);

// Download document
router.get('/:id/:documentId/download', documentController.downloadDocument);

// Delete document
router.delete('/:id/:documentId', documentController.deleteDocument);

module.exports = router;