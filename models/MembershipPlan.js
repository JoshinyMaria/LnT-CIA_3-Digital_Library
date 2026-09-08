const mongoose = require("mongoose");

const membershipPlanSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Plan name is required"],
      unique: true,
      trim: true,
    },
    memberType: {
      type: String,
      enum: ["student", "faculty"],
      required: [true, "Member type is required"],
    },
    maxBooksAllowed: {
      type: Number,
      required: [true, "Max books allowed is required"],
      min: 1,
    },
    loanDurationDays: {
      type: Number,
      required: [true, "Loan duration is required"],
      min: 1,
    },
    maxRenewals: {
      type: Number,
      default: 0,
    },
    finePerDay: {
      type: Number,
      required: [true, "Fine per day is required"],
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MembershipPlan", membershipPlanSchema);
