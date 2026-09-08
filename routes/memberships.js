const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const membershipController = require("../controllers/membershipController");

router.get("/", membershipController.getAllPlans);
router.get("/:id", membershipController.getPlan);

router.post(
  "/",
  protect,
  authorize("admin"),
  [
    body("name").notEmpty().withMessage("Plan name is required"),
    body("memberType").isIn(["student", "faculty"]).withMessage("Valid member type is required"),
    body("maxBooksAllowed")
      .isInt({ min: 1 })
      .withMessage("Max books allowed must be at least 1"),
    body("loanDurationDays")
      .isInt({ min: 1 })
      .withMessage("Loan duration must be at least 1 day"),
    body("finePerDay").isNumeric().withMessage("Fine per day is required"),
  ],
  validate,
  membershipController.createPlan
);

router.put(
  "/:id",
  protect,
  authorize("admin"),
  membershipController.updatePlan
);

router.delete(
  "/:id",
  protect,
  authorize("admin"),
  membershipController.deletePlan
);

module.exports = router;
