const { Application, Education, Document, User, sequelize } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notificationService');

// Get all applications for a user
exports.getUserApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']],
    });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

// Get a single application by ID
exports.getApplication = async (req, res) => {
  try {
    const application = await Application.findOne({
      where: {
        id: req.params.id,
        userId: req.user.id,
      },
      include: [
        {
          model: Education,
          as: 'Educations',
        },
        {
          model: Document,
          as: 'Documents',
        },
      ],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application',
      error: error.message,
    });
  }
};

// Create new application
exports.createApplication = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      program,
      department,
      academicYear,
      semester,
      disabilityStatus,
      disabilityType,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
    } = req.body;

    // Create application
    const application = await Application.create(
      {
        userId: req.user.id,
        program,
        department,
        academicYear,
        semester,
        currentStep: 1,
        completedSteps: [],
        status: 'draft',
        disabilityStatus,
        disabilityType,
        emergencyContactName,
        emergencyContactPhone,
        emergencyContactRelationship,
      },
      { transaction }
    );

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'CREATE_APPLICATION',
      resourceType: 'Application',
      resourceId: application.id,
      description: 'Created new application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: application,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Create application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create application',
      error: error.message,
    });
  }
};

// Update application
exports.updateApplication = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
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

    const {
      program,
      department,
      academicYear,
      semester,
      disabilityStatus,
      disabilityType,
      emergencyContactName,
      emergencyContactPhone,
      emergencyContactRelationship,
      currentStep,
      completedSteps,
    } = req.body;

    // Update application
    await application.update(
      {
        program: program || application.program,
        department: department || application.department,
        academicYear: academicYear || application.academicYear,
        semester: semester || application.semester,
        disabilityStatus: disabilityStatus !== undefined ? disabilityStatus : application.disabilityStatus,
        disabilityType: disabilityType || application.disabilityType,
        emergencyContactName: emergencyContactName || application.emergencyContactName,
        emergencyContactPhone: emergencyContactPhone || application.emergencyContactPhone,
        emergencyContactRelationship: emergencyContactRelationship || application.emergencyContactRelationship,
        currentStep: currentStep || application.currentStep,
        completedSteps: completedSteps || application.completedSteps,
      },
      { transaction }
    );

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'UPDATE_APPLICATION',
      resourceType: 'Application',
      resourceId: application.id,
      description: 'Updated application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Update application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update application',
      error: error.message,
    });
  }
};

// Submit application
exports.submitApplication = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
      include: [
        {
          model: Education,
          as: 'Educations',
        },
        {
          model: Document,
          as: 'Documents',
        },
      ],
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    // Check if application can be submitted
    if (application.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Application already submitted',
      });
    }

    // Validate application completeness
    if (!application.program || !application.department || !application.academicYear) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Application is incomplete',
      });
    }

    // Check if education records exist
    if (!application.Educations || application.Educations.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Education records are required',
      });
    }

    // Check if required documents exist
    if (!application.Documents || application.Documents.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Required documents are missing',
      });
    }

    // Update application status
    await application.update(
      {
        status: 'submitted',
        submittedAt: new Date(),
        completedSteps: [1, 2, 3, 4], // All steps completed
      },
      { transaction }
    );

    // Get user
    const user = await User.findByPk(req.user.id);

    // Send notification
    await sendNotification({
      userId: req.user.id,
      type: 'email',
      title: 'Application Submitted',
      message: `Dear ${user.firstName}, your application #${application.applicationNumber} has been successfully submitted. We will review it shortly.`,
      relatedTo: application.id,
      transaction,
    });

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'SUBMIT_APPLICATION',
      resourceType: 'Application',
      resourceId: application.id,
      description: 'Submitted application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Application submitted successfully',
      data: application,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Submit application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit application',
      error: error.message,
    });
  }
};

// Add education record
exports.addEducation = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
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

    const {
      institutionName,
      institutionType,
      country,
      city,
      degree,
      fieldOfStudy,
      startDate,
      endDate,
      isCurrentlyStudying,
      grade,
      description,
    } = req.body;

    // Create education record
    const education = await Education.create(
      {
        applicationId,
        institutionName,
        institutionType,
        country,
        city,
        degree,
        fieldOfStudy,
        startDate,
        endDate,
        isCurrentlyStudying,
        grade,
        description,
      },
      { transaction }
    );

    // Update application step if not already completed
    if (!application.completedSteps.includes(2)) {
      const completedSteps = [...application.completedSteps, 2];
      await application.update(
        {
          completedSteps,
          currentStep: Math.max(application.currentStep, 3),
        },
        { transaction }
      );
    }

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'ADD_EDUCATION',
      resourceType: 'Education',
      resourceId: education.id,
      description: 'Added education record',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });

    await transaction.commit();

    res.status(201).json({
      success: true,
      data: education,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Add education error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add education record',
      error: error.message,
    });
  }
};

// Get application status
exports.getApplicationStatus = async (req, res) => {
  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
        userId: req.user.id,
      },
      attributes: ['id', 'applicationNumber', 'status', 'submittedAt', 'reviewedAt', 'comments', 'rejectionReason'],
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found',
      });
    }

    res.status(200).json({
      success: true,
      data: application,
    });
  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application status',
      error: error.message,
    });
  }
};

// Delete application (only for draft applications)
exports.deleteApplication = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const applicationId = req.params.id;
    const application = await Application.findOne({
      where: {
        id: applicationId,
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

    // Check if application can be deleted
    if (application.status !== 'draft') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Cannot delete submitted application',
      });
    }

    // Delete associated records (cascade deletes will handle this automatically)
    await application.destroy({ transaction });

    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'DELETE_APPLICATION',
      resourceType: 'Application',
      resourceId: applicationId,
      description: 'Deleted application',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully',
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete application',
      error: error.message,
    });
  }
};