const { User, Application, Document, Education, AuditLog, sequelize } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');
const { sendNotification } = require('../utils/notificationService');

// Get all applications (for admin)
exports.getAllApplications = async (req, res) => {
  try {
    // Parse pagination and filtering parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const offset = (page - 1) * limit;
    
    // Parse filter parameters
    const status = req.query.status;
    const settlementSite = req.query.settlementSite;
    const program = req.query.program;
    const searchTerm = req.query.search;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (program) filter.program = program;
    
    // Join user if we're filtering by settlement site
    const include = [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'settlementSite'],
      },
    ];
    
    if (settlementSite) {
      include[0].where = { settlementSite };
    }
    
    // Add search term filtering if provided
    if (searchTerm) {
      include[0].where = {
        ...include[0].where,
        [Op.or]: [
          { firstName: { [Op.iLike]: `%${searchTerm}%` } },
          { lastName: { [Op.iLike]: `%${searchTerm}%` } },
          { email: { [Op.iLike]: `%${searchTerm}%` } },
        ],
      };
    }
    
    // Fetch applications with pagination and filtering
    const { count, rows: applications } = await Application.findAndCountAll({
      where: filter,
      include,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
      distinct: true,
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      count,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        totalCount: count,
      },
      data: applications,
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch applications',
      error: error.message,
    });
  }
};

// Get application details (for admin)
exports.getApplicationDetails = async (req, res) => {
  try {
    const applicationId = req.params.id;
    
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: User,
          attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
        },
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
    console.error('Get application details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application details',
      error: error.message,
    });
  }
};

// Review application
exports.reviewApplication = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const applicationId = req.params.id;
    const { status, comments, rejectionReason } = req.body;
    
    const application = await Application.findByPk(applicationId, {
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email', 'phone'],
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
    
    // Check if application can be reviewed
    if (application.status !== 'submitted' && application.status !== 'under_review') {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Cannot review application with status: ${application.status}`,
      });
    }
    
    // Update application status
    await application.update({
      status,
      reviewedAt: new Date(),
      reviewedBy: req.user.id,
      comments: comments || application.comments,
      rejectionReason: rejectionReason || application.rejectionReason,
    }, { transaction });
    
    // Send notification to applicant
    let notificationTitle, notificationMessage;
    
    if (status === 'approved') {
      notificationTitle = 'Application Approved';
      notificationMessage = `Dear ${application.User.firstName}, congratulations! Your application #${application.applicationNumber} has been approved.`;
    } else if (status === 'rejected') {
      notificationTitle = 'Application Rejected';
      notificationMessage = `Dear ${application.User.firstName}, we regret to inform you that your application #${application.applicationNumber} has been rejected.`;
      if (rejectionReason) {
        notificationMessage += ` Reason: ${rejectionReason}`;
      }
    } else if (status === 'under_review') {
      notificationTitle = 'Application Under Review';
      notificationMessage = `Dear ${application.User.firstName}, your application #${application.applicationNumber} is now under review.`;
    } else if (status === 'waitlisted') {
      notificationTitle = 'Application Waitlisted';
      notificationMessage = `Dear ${application.User.firstName}, your application #${application.applicationNumber} has been waitlisted.`;
    }
    
    await sendNotification({
      userId: application.User.id,
      type: 'email',
      title: notificationTitle,
      message: notificationMessage,
      relatedTo: application.id,
      transaction,
    });
    
    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'REVIEW_APPLICATION',
      resourceType: 'Application',
      resourceId: application.id,
      description: `Reviewed application: Status changed to ${status}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      previousValues: { status: application.status },
      newValues: { status },
      transaction,
    });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: `Application ${status} successfully`,
      data: application,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to review application',
      error: error.message,
    });
  }
};

// Verify document
exports.verifyDocument = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id, documentId } = req.params;
    const { verified, comments } = req.body;
    
    const document = await Document.findOne({
      where: { id: documentId, applicationId: id },
      include: [
        {
          model: Application,
          include: [
            {
              model: User,
              attributes: ['id'],
            },
          ],
        },
      ],
    });
    
    if (!document) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Document not found',
      });
    }
    
    // Update document verification status
    await document.update({
      verified,
      verifiedBy: req.user.id,
      verifiedAt: new Date(),
      comments: comments || document.comments,
    }, { transaction });
    
    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'VERIFY_DOCUMENT',
      resourceType: 'Document',
      resourceId: document.id,
      description: `Document ${verified ? 'verified' : 'rejected'}: ${document.name}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
      transaction,
    });
    
    await transaction.commit();
    
    res.status(200).json({
      success: true,
      message: `Document ${verified ? 'verified' : 'rejected'} successfully`,
      data: document,
    });
  } catch (error) {
    await transaction.rollback();
    console.error('Verify document error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to verify document',
      error: error.message,
    });
  }
};

// Get application statistics
exports.getApplicationStats = async (req, res) => {
  try {
    // Total applications
    const totalApplications = await Application.count();
    
    // Applications by status
    const submittedCount = await Application.count({ where: { status: 'submitted' } });
    const underReviewCount = await Application.count({ where: { status: 'under_review' } });
    const approvedCount = await Application.count({ where: { status: 'approved' } });
    const rejectedCount = await Application.count({ where: { status: 'rejected' } });
    const waitlistedCount = await Application.count({ where: { status: 'waitlisted' } });
    const draftCount = await Application.count({ where: { status: 'draft' } });
    
    // Applications by settlement site
    const rwamwanjaCount = await Application.count({
      include: [
        {
          model: User,
          where: { settlementSite: 'Rwamwanja' },
          attributes: [],
        },
      ],
    });
    
    const kyangwaliCount = await Application.count({
      include: [
        {
          model: User,
          where: { settlementSite: 'Kyangwali' },
          attributes: [],
        },
      ],
    });
    
    const nakivaleCount = await Application.count({
      include: [
        {
          model: User,
          where: { settlementSite: 'Nakivale' },
          attributes: [],
        },
      ],
    });
    
    // Applications by date
    const currentDate = new Date();
    const lastMonthDate = new Date();
    lastMonthDate.setMonth(currentDate.getMonth() - 1);
    
    const lastMonthApplications = await Application.count({
      where: {
        createdAt: {
          [Op.gte]: lastMonthDate,
          [Op.lte]: currentDate,
        },
      },
    });
    
    // Recent applications
    const recentApplications = await Application.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: User,
          attributes: ['firstName', 'lastName', 'email', 'settlementSite'],
        },
      ],
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalApplications,
        byStatus: {
          submitted: submittedCount,
          underReview: underReviewCount,
          approved: approvedCount,
          rejected: rejectedCount,
          waitlisted: waitlistedCount,
          draft: draftCount,
        },
        bySettlementSite: {
          rwamwanja: rwamwanjaCount,
          kyangwali: kyangwaliCount,
          nakivale: nakivaleCount,
        },
        lastMonthApplications,
        recentApplications,
      },
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch application statistics',
      error: error.message,
    });
  }
};

// Get audit logs
exports.getAuditLogs = async (req, res) => {
  try {
    // Parse pagination parameters
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const offset = (page - 1) * limit;
    
    // Parse filter parameters
    const action = req.query.action;
    const resourceType = req.query.resourceType;
    const userId = req.query.userId;
    const resourceId = req.query.resourceId;
    
    // Build filter object
    const filter = {};
    if (action) filter.action = action;
    if (resourceType) filter.resourceType = resourceType;
    if (userId) filter.userId = userId;
    if (resourceId) filter.resourceId = resourceId;
    
    // Fetch audit logs with pagination and filtering
    const { count, rows: auditLogs } = await AuditLog.findAndCountAll({
      where: filter,
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName', 'email'],
        },
      ],
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
    
    // Calculate pagination metadata
    const totalPages = Math.ceil(count / limit);
    
    res.status(200).json({
      success: true,
      count,
      pagination: {
        currentPage: page,
        totalPages,
        limit,
        totalCount: count,
      },
      data: auditLogs,
    });
  } catch (error) {
    console.error('Get audit logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch audit logs',
      error: error.message,
    });
  }
};

// Export applications (CSV)
exports.exportApplications = async (req, res) => {
  try {
    // Parse filter parameters
    const status = req.query.status;
    const settlementSite = req.query.settlementSite;
    const program = req.query.program;
    
    // Build filter object
    const filter = {};
    if (status) filter.status = status;
    if (program) filter.program = program;
    
    // Join user if we're filtering by settlement site
    const include = [
      {
        model: User,
        attributes: ['id', 'firstName', 'lastName', 'email', 'phone', 'gender', 'dateOfBirth', 'nationality', 'settlementSite', 'refugeeId'],
      },
    ];
    
    if (settlementSite) {
      include[0].where = { settlementSite };
    }
    
    // Fetch applications
    const applications = await Application.findAll({
      where: filter,
      include,
      order: [['createdAt', 'DESC']],
    });
    
    // Format data for CSV
    const csvData = applications.map(app => ({
      'Application Number': app.applicationNumber,
      'Status': app.status,
      'First Name': app.User.firstName,
      'Last Name': app.User.lastName,
      'Email': app.User.email,
      'Phone': app.User.phone,
      'Gender': app.User.gender,
      'Date of Birth': app.User.dateOfBirth,
      'Nationality': app.User.nationality,
      'Settlement Site': app.User.settlementSite,
      'Refugee ID': app.User.refugeeId,
      'Program': app.program,
      'Department': app.department,
      'Academic Year': app.academicYear,
      'Semester': app.semester,
      'Disability Status': app.disabilityStatus ? 'Yes' : 'No',
      'Disability Type': app.disabilityType,
      'Submitted At': app.submittedAt,
      'Reviewed At': app.reviewedAt,
    }));
    
    // Convert to CSV string
    const csvFields = Object.keys(csvData[0] || {});
    const json2csvParser = new Parser({ fields: csvFields });
    const csv = json2csvParser.parse(csvData);
    
    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=applications.csv');
    
    // Send CSV data
    res.send(csv);
    
    // Create audit log
    await createAuditLog({
      userId: req.user.id,
      action: 'EXPORT_APPLICATIONS',
      resourceType: 'Application',
      description: 'Exported applications to CSV',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
  } catch (error) {
    console.error('Export applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export applications',
      error: error.message,
    });
  }
};