const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const reportController = require("../controllers/reportController");

router.get("/overdue", protect, authorize("librarian", "admin"), reportController.overdueReport);
router.get("/most-borrowed", protect, authorize("librarian", "admin"), reportController.mostBorrowedBooks);
router.get("/inventory", protect, authorize("librarian", "admin"), reportController.inventoryHealth);

router.put(
  "/inventory/:id/copy-status",
  protect,
  authorize("librarian", "admin"),
  [
    body("lostCopies").optional().isInt({ min: 0 }),
    body("damagedCopies").optional().isInt({ min: 0 }),
  ],
  validate,
  reportController.updateCopyStatus
);

module.exports = router;
