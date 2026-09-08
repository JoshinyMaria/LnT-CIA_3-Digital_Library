const express = require("express");
const router = express.Router();
const { body, query } = require("express-validator");
const validate = require("../middleware/validate");
const { protect, authorize } = require("../middleware/auth");
const bookController = require("../controllers/bookController");

router.get(
  "/search",
  [
    query("title").optional().isString(),
    query("author").optional().isString(),
    query("category").optional().isString(),
    query("available").optional().isBoolean(),
  ],
  validate,
  bookController.searchBooks
);

router.get("/", bookController.getAllBooks);
router.get("/:id", bookController.getBook);

router.post(
  "/",
  protect,
  authorize("librarian", "admin"),
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("author").notEmpty().withMessage("Author is required"),
    body("isbn").notEmpty().withMessage("ISBN is required"),
    body("category").notEmpty().withMessage("Category is required"),
    body("totalCopies")
      .isInt({ min: 1 })
      .withMessage("Total copies must be at least 1"),
  ],
  validate,
  bookController.addBook
);

router.put(
  "/:id",
  protect,
  authorize("librarian", "admin"),
  bookController.updateBook
);

router.delete(
  "/:id",
  protect,
  authorize("librarian", "admin"),
  bookController.deleteBook
);

module.exports = router;
