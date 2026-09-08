const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member ID is required"],
    },
    transactionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Transaction",
      required: [true, "Transaction ID is required"],
    },
    type: {
      type: String,
      enum: ["overdue_reminder", "due_soon", "hold_available"],
      default: "overdue_reminder",
    },
    message: {
      type: String,
      required: [true, "Message is required"],
    },
    sentAt: {
      type: Date,
      default: Date.now,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ memberId: 1 });
notificationSchema.index({ transactionId: 1 });

module.exports = mongoose.model("Notification", notificationSchema);
