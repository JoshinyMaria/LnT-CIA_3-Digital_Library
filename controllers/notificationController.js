const Notification = require("../models/Notification");
const Transaction = require("../models/Transaction");
const User = require("../models/User");
const { isOwnerOrStaff } = require("../utils/helpers");

// Module 9: Generate overdue notifications
exports.generateOverdueNotifications = async (req, res, next) => {
  try {
    const now = new Date();

    // Find overdue transactions that haven't been returned
    const overdueTransactions = await Transaction.find({
      status: { $in: ["issued", "overdue"] },
      dueDate: { $lt: now },
    }).populate("memberId", "name email");

    let notificationsCreated = 0;

    for (const transaction of overdueTransactions) {
      // Check if notification already exists for this transaction
      const existingNotification = await Notification.findOne({
        transactionId: transaction._id,
        type: "overdue_reminder",
        sentAt: { $gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) },
      });

      if (!existingNotification) {
        const diffDays = Math.ceil(
          (now.getTime() - transaction.dueDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        await Notification.create({
          memberId: transaction.memberId._id,
          transactionId: transaction._id,
          type: "overdue_reminder",
          message: `Reminder: "${transaction.bookTitle}" was due ${diffDays} day(s) ago. Please return it to avoid further fines.`,
        });

        // Update transaction status to overdue
        if (transaction.status !== "overdue") {
          transaction.status = "overdue";
          await transaction.save();
        }

        notificationsCreated++;
      }
    }

    res.status(200).json({
      success: true,
      message: `Generated ${notificationsCreated} overdue notification(s)`,
      data: { count: notificationsCreated },
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications for a member
exports.getMemberNotifications = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    if (!isOwnerOrStaff(req.user, memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this member's notifications",
        errorCode: "FORBIDDEN",
      });
    }

    const notifications = await Notification.find({ memberId })
      .populate("transactionId", "bookTitle dueDate returnDate")
      .sort({ sentAt: -1 });

    res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (!isOwnerOrStaff(req.user, notification.memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to modify this notification",
        errorCode: "FORBIDDEN",
      });
    }

    notification.isRead = true;
    await notification.save();

    res.status(200).json({
      success: true,
      message: "Notification marked as read",
      data: notification,
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { memberId: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    next(error);
  }
};
