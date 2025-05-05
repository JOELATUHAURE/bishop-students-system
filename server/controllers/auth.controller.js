const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, Role } = require('../models');
const { createAuditLog } = require('../utils/auditLogger');

// Register user
exports.register = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      settlementSite,
      preferredLanguage
    } = req.body;

    // Check if user already exists
    const userExists = await User.findOne({ where: { email } });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phone,
      settlementSite: settlementSite || 'None',
      preferredLanguage: preferredLanguage || 'english',
    });

    // Find applicant role
    const applicantRole = await Role.findOne({ where: { name: 'applicant' } });
    if (applicantRole) {
      await user.addRole(applicantRole);
    }

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'REGISTER',
      resourceType: 'User',
      resourceId: user.id,
      description: 'User registration',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        settlementSite: user.settlementSite,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to register user',
      error: error.message,
    });
  }
};

// Login user
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
      include: {
        model: Role,
        through: { attributes: [] },
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Update last login
    await user.update({ lastLoginAt: new Date() });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'LOGIN',
      resourceType: 'User',
      resourceId: user.id,
      description: 'User login',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    // Get user roles
    const roles = user.Roles.map(role => role.name);

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        roles,
        settlementSite: user.settlementSite,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to login',
      error: error.message,
    });
  }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      include: {
        model: Role,
        through: { attributes: [] },
      },
      attributes: { exclude: ['password', 'resetPasswordToken', 'resetPasswordExpire'] },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const roles = user.Roles.map(role => role.name);

    res.status(200).json({
      success: true,
      data: {
        ...user.toJSON(),
        roles,
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get user data',
      error: error.message,
    });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).slice(-8);
    
    // Hash token and set to resetPasswordToken field
    const salt = await bcrypt.genSalt(10);
    const hashedResetToken = await bcrypt.hash(resetToken, salt);
    
    // Set token expire
    const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    
    await user.update({
      resetPasswordToken: hashedResetToken,
      resetPasswordExpire,
    });

    // TODO: Send email or SMS with reset token

    res.status(200).json({
      success: true,
      message: 'Password reset token sent',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process password reset',
      error: error.message,
    });
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Find user with token
    const user = await User.findOne({
      where: {
        resetPasswordToken: token,
        resetPasswordExpire: { [Op.gt]: new Date() },
      },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Update user
    await user.update({
      password: hashedPassword,
      resetPasswordToken: null,
      resetPasswordExpire: null,
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'RESET_PASSWORD',
      resourceType: 'User',
      resourceId: user.id,
      description: 'User reset password',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successful',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      phone,
      gender,
      dateOfBirth,
      nationality,
      address,
      city,
      state,
      country,
      postalCode,
      preferredLanguage,
    } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Update user
    await user.update({
      firstName: firstName || user.firstName,
      lastName: lastName || user.lastName,
      phone: phone || user.phone,
      gender: gender || user.gender,
      dateOfBirth: dateOfBirth || user.dateOfBirth,
      nationality: nationality || user.nationality,
      address: address || user.address,
      city: city || user.city,
      state: state || user.state,
      country: country || user.country,
      postalCode: postalCode || user.postalCode,
      preferredLanguage: preferredLanguage || user.preferredLanguage,
    });

    // Create audit log
    await createAuditLog({
      userId: user.id,
      action: 'UPDATE_PROFILE',
      resourceType: 'User',
      resourceId: user.id,
      description: 'User updated profile',
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        gender: user.gender,
        dateOfBirth: user.dateOfBirth,
        nationality: user.nationality,
        settlementSite: user.settlementSite,
        address: user.address,
        city: user.city,
        state: user.state,
        country: user.country,
        postalCode: user.postalCode,
        preferredLanguage: user.preferredLanguage,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message,
    });
  }
};