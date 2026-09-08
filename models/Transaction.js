const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
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
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Issuer ID is required"],
    },
    issueDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    returnDate: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      default: 0,
    },
    finePaid: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["issued", "returned", "overdue"],
      default: "issued",
    },
    bookTitle: {
      type: String,
      default: "",
    },
    memberName: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

transactionSchema.index({ bookId: 1 });
transactionSchema.index({ memberId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ dueDate: 1 });

module.exports = mongoose.model("Transaction", transactionSchema);
