const express = require("express");
const router = express.Router();
const { protect, authorize } = require("../middleware/auth");
const notificationController = require("../controllers/notificationController");

router.post(
  "/generate-overdue",
  protect,
  authorize("librarian", "admin"),
  notificationController.generateOverdueNotifications
);

router.get("/member/:memberId", protect, notificationController.getMemberNotifications);
router.put("/:id/read", protect, notificationController.markAsRead);
router.put("/read-all", protect, notificationController.markAllAsRead);

module.exports = router;
