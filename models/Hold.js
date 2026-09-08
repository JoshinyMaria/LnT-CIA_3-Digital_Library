const mongoose = require("mongoose");

const holdSchema = new mongoose.Schema(
  {
    bookId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Book",
      required: [true, "Book ID is required"],
    },
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Member ID is required"],
    },
    requestedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["pending", "fulfilled", "cancelled", "expired"],
      default: "pending",
    },
    notifiedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

holdSchema.index({ bookId: 1 });
holdSchema.index({ memberId: 1 });
holdSchema.index({ status: 1 });

module.exports = mongoose.model("Hold", holdSchema);
