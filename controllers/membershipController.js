const MembershipPlan = require("../models/MembershipPlan");

// Module 7: Create membership plan
exports.createPlan = async (req, res, next) => {
  try {
    const { name, memberType, maxBooksAllowed, loanDurationDays, maxRenewals, finePerDay } =
      req.body;

    const existingPlan = await MembershipPlan.findOne({ name });
    if (existingPlan) {
      return res.status(409).json({
        success: false,
        message: "A plan with this name already exists",
        errorCode: "DUPLICATE_PLAN",
      });
    }

    const plan = await MembershipPlan.create({
      name,
      memberType,
      maxBooksAllowed,
      loanDurationDays,
      maxRenewals: maxRenewals || 0,
      finePerDay,
    });

    res.status(201).json({
      success: true,
      message: "Membership plan created successfully",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// Get all membership plans
exports.getAllPlans = async (req, res, next) => {
  try {
    const plans = await MembershipPlan.find().sort({ memberType: 1 });

    res.status(200).json({
      success: true,
      data: plans,
    });
  } catch (error) {
    next(error);
  }
};

// Get single plan
exports.getPlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// Update membership plan
exports.updatePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan updated successfully",
      data: plan,
    });
  } catch (error) {
    next(error);
  }
};

// Delete membership plan
exports.deletePlan = async (req, res, next) => {
  try {
    const plan = await MembershipPlan.findByIdAndDelete(req.params.id);

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: "Plan not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Plan deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};
