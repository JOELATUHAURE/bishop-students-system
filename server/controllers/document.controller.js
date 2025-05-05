const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Document, Application, sequelize } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Create unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, uniqueSuffix + ext);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  // Accept only PDFs, images, and common document formats
  const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
  const mimetype = allowedTypes.test(file.mimetype);
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  
  cb(new Error('Only .jpeg, .jpg, .png, .gif, .pdf, .doc, .docx files are allowed!'));
};

// Configure upload limits
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  }
});

// Helper function to handle file upload
exports.uploadFile = upload.single('file');

// Upload document
exports.uploadDocument = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }
    
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
    });
    
    if (!application) {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
    
    // Check if application can be updated
    if (application.status !== 'draft') {
      // Remove uploaded file
      fs.unlinkSync(req.file.path);
      
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot update submitted application',
      });
    }
    
    const { name, type, institution } = req.body;
    
    // Create document record
    const document = await Document.create({
      applicationId,
      name,
      type,
      institution,
      filePath: req.file.path,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
    }, { transaction });
    
    // Update application step if not already completed
    if (!application.completedSteps.includes(3)) {
      const completedSteps = [...application.completedSteps, 3];
      await application.update({
        completedSteps,
        currentStep: Math.max(application.currentStep, 4),
      }, { transaction });
    }
    
    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'UPLOAD_DOCUMENT',
      resourceType: 'Document',
      resourceId: document.id,
      description: `Uploaded document: ${name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });
    
    await transaction.commit();
    
    res.status(201).json({
      success: true,
      data: {
        id: document.id,
        name: document.name,
        type: document.type,
        institution: document.institution,
        uploadDate: document.uploadDate,
        fileSize: document.fileSize,
      },
    });
  } catch (error) {
    // Remove uploaded file if it exists
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    
    await transaction.rollback();
    console.error('Upload document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload document',
      error: error.message,
    });
  }
};

// Get documents for an application
exports.getDocuments = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
    
    const documents = await Document.findAll({
      where: { applicationId },
      attributes: ['id', 'name', 'type', 'institution', 'uploadDate', 'fileSize', 'verified', 'verifiedAt', 'comments'],
    });
    
    res.status(200).json({
      success: true,
      count: documents.length,
      data: documents,
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documents',
      error: error.message,
    });
  }
};

// Get a single document
exports.getDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const application = await Application.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
    
    const document = await Document.findOne({
      where: {
        id: documentId,
        applicationId: id,
      },
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    res.status(200).json({
      success: true,
      data: document,
    });
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch document',
      error: error.message,
    });
  }
};

// Download document
exports.downloadDocument = async (req, res) => {
  try {
    const { id, documentId } = req.params;
    
    const application = await Application.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });
    
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
    
    const document = await Document.findOne({
      where: {
        id: documentId,
        applicationId: id,
      },
    });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    // Check if file exists
    if (!fs.existsSync(document.filePath)) {
      return res.status(404).json({
        success: false,
        message: 'File not found',
      });
    }
    
    res.download(document.filePath, document.name);
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to download document',
      error: error.message,
    });
  }
};

// Delete document
exports.deleteDocument = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, documentId } = req.params;
    
    const application = await Application.findOne({
      where: {
        id,
        userId: req.user.id,
      },
    });
    
    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }
    
    // Check if application can be updated
    if (application.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot update submitted application',
      });
    }
    
    const document = await Document.findOne({
      where: {
        id: documentId,
        applicationId: id,
      },
    });
    
    if (!document) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    // Delete file from storage
    if (fs.existsSync(document.filePath)) {
      fs.unlinkSync(document.filePath);
    }
    
    // Delete document record
    await document.destroy({ transaction });
    
    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE_DOCUMENT',
      resourceType: 'Document',
      resourceId: documentId,
      description: `Deleted document: ${document.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: 'Document deleted successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete document',
      error: error.message,
    });
  }
};