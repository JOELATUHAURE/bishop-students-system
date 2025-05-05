const { Notification } = require('../models');
const twilio = require('twilio');

// Initialize Twilio client with validation
let twilioClient;
if (
  process.env.TWILIO_ACCOUNT_SID && 
  process.env.TWILIO_AUTH_TOKEN && 
  process.env.TWILIO_ACCOUNT_SID.startsWith('AC')
) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
} else {
  console.warn('Invalid or missing Twilio credentials. SMS notifications will be disabled.');
}

// Send notification
exports.sendNotification = async ({
  userId,
  type,
  title,
  message,
  relatedTo,
  transaction,
}) => {
  try {
    // Create notification record
    const notification = await Notification.create({
      userId,
      type,
      title,
      message,
      relatedTo,
      status: 'pending',
    }, transaction ? { transaction } : {});

    // Send notification based on type
    let success = false;

    if (type === 'email') {
      // TODO: Implement email sending logic
      // For now, mark as sent for demo purposes
      success = true;
    } else if (type === 'sms' && twilioClient) {
      try {
        // Fetch user phone number
        const user = await User.findByPk(userId);
        if (user && user.phone) {
          // Send SMS via Twilio
          await twilioClient.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: user.phone,
          });
          success = true;
        }
      } catch (twilioError) {
        console.error('Twilio SMS error:', twilioError);
      }
    } else if (type === 'in_app') {
      // In-app notifications are automatically delivered when queried
      success = true;
    }

    // Update notification status
    await notification.update({
      status: success ? 'sent' : 'failed',
      sentAt: success ? new Date() : null,
    }, transaction ? { transaction } : {});

    return {
      success,
      notification,
    };
  } catch (error) {
    console.error('Send notification error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Get unread notifications for user
exports.getUnreadNotifications = async (userId) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        userId,
        isRead: false,
        status: 'sent',
      },
      order: [['createdAt', 'DESC']],
    });

    return {
      success: true,
      count: notifications.length,
      data: notifications,
    };
  } catch (error) {
    console.error('Get unread notifications error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Mark notification as read
exports.markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: notificationId,
        userId,
      },
    });

    if (!notification) {
      return {
        success: false,
        message: 'Notification not found',
      };
    }

    await notification.update({
      isRead: true,
      readAt: new Date(),
    });

    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error('Mark notification as read error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};