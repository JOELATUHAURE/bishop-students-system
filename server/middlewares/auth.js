const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Get token from Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database
      const user = await User.findByPk(decoded.id, {
        include: {
          model: Role,
          through: { attributes: [] },
        },
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found',
        });
      }

      // Check if user is active
      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'User account is deactivated',
        });
      }

      // Add user to request object
      req.user = user;
      req.user.roles = user.Roles.map(role => role.name);
      next();
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route',
        error: error.message,
      });
    }
  } catch (error) {
    next(error);
  }
};

// Authorize by role
exports.authorize = (roles) => {
  return (req, res, next) => {
    // Check if user has required roles
    const hasRole = req.user.roles.some(role => roles.includes(role));

    if (!hasRole) {
      // Log unauthorized access attempt
      createAuditLog({
        userId: req.user.id,
        action: 'UNAUTHORIZED_ACCESS',
        resourceType: 'Route',
        resourceId: req.originalUrl,
        description: 'Attempted to access restricted route',
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      });

      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this route',
      });
    }

    next();
  };
};