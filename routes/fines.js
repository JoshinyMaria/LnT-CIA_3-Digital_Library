const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const fineController = require("../controllers/fineController");

router.post(
  "/pay",
  protect,
  [body("transactionId").notEmpty().withMessage("Transaction ID is required")],
  validate,
  fineController.payFine
);

router.post(
  "/waive",
  protect,
  authorize("librarian", "admin"),
  [body("transactionId").notEmpty().withMessage("Transaction ID is required")],
  validate,
  fineController.waiveFine
);

router.get("/member/:memberId", protect, fineController.getMemberFines);
router.get("/", protect, authorize("librarian", "admin"), fineController.getAllFinePayments);

module.exports = router;
