const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const holdController = require("../controllers/holdController");

router.post(
  "/",
  protect,
  [body("bookId").notEmpty().withMessage("Book ID is required")],
  validate,
  holdController.placeHold
);

router.put("/:id/cancel", protect, holdController.cancelHold);
router.get("/book/:bookId", protect, holdController.getBookHolds);
router.get("/member/:memberId", protect, holdController.getMemberHolds);
router.get("/", protect, authorize("librarian", "admin"), holdController.getAllHolds);

module.exports = router;
