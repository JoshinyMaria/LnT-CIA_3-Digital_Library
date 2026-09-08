const Hold = require("../models/Hold");
const Book = require("../models/Book");
const User = require("../models/User");
const { isOwnerOrStaff } = require("../utils/helpers");

// Module 6: Place a hold
exports.placeHold = async (req, res, next) => {
  try {
    const { bookId } = req.body;
    const memberId = req.user._id;

    const book = await Book.findById(bookId);
    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    // Check if member already has an active hold on this book
    const existingHold = await Hold.findOne({
      bookId,
      memberId,
      status: "pending",
    });

    if (existingHold) {
      return res.status(409).json({
        success: false,
        message: "You already have a pending hold on this book",
        errorCode: "DUPLICATE_HOLD",
      });
    }

    // Check if member already has this book issued
    const Transaction = require("../models/Transaction");
    const existingTransaction = await Transaction.findOne({
      bookId,
      memberId,
      status: { $in: ["issued", "overdue"] },
    });

    if (existingTransaction) {
      return res.status(409).json({
        success: false,
        message: "You already have this book issued",
        errorCode: "ALREADY_ISSUED",
      });
    }

    const hold = await Hold.create({
      bookId,
      memberId,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    });

    await hold.populate("bookId", "title author isbn");
    await hold.populate("memberId", "name email");

    res.status(201).json({
      success: true,
      message: "Hold placed successfully",
      data: hold,
    });
  } catch (error) {
    next(error);
  }
};

// Module 6: Cancel a hold
exports.cancelHold = async (req, res, next) => {
  try {
    const hold = await Hold.findById(req.params.id);

    if (!hold) {
      return res.status(404).json({
        success: false,
        message: "Hold not found",
        errorCode: "NOT_FOUND",
      });
    }

    if (hold.memberId.toString() !== req.user._id.toString() && req.user.role === "member") {
      return res.status(403).json({
        success: false,
        message: "Not authorized to cancel this hold",
        errorCode: "FORBIDDEN",
      });
    }

    if (hold.status !== "pending") {
      return res.status(409).json({
        success: false,
        message: "Only pending holds can be cancelled",
        errorCode: "INVALID_STATUS",
      });
    }

    hold.status = "cancelled";
    await hold.save();

    res.status(200).json({
      success: true,
      message: "Hold cancelled successfully",
      data: hold,
    });
  } catch (error) {
    next(error);
  }
};

// Get holds for a book
exports.getBookHolds = async (req, res, next) => {
  try {
    const holds = await Hold.find({
      bookId: req.params.bookId,
      status: { $in: ["pending", "fulfilled"] },
    })
      .populate("memberId", "name email membershipId")
      .sort({ requestedAt: 1 });

    res.status(200).json({
      success: true,
      data: holds,
    });
  } catch (error) {
    next(error);
  }
};

// Get holds for a member
exports.getMemberHolds = async (req, res, next) => {
  try {
    const memberId = req.params.memberId;

    if (!isOwnerOrStaff(req.user, memberId)) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to view this member's holds",
        errorCode: "FORBIDDEN",
      });
    }

    const holds = await Hold.find({ memberId })
      .populate("bookId", "title author isbn category")
      .sort({ requestedAt: -1 });

    res.status(200).json({
      success: true,
      data: holds,
    });
  } catch (error) {
    next(error);
  }
};

// Get all pending holds (librarian)
exports.getAllHolds = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = {};
    if (status) query.status = status;

    const total = await Hold.countDocuments(query);
    const holds = await Hold.find(query)
      .populate("bookId", "title author isbn")
      .populate("memberId", "name email membershipId")
      .sort({ requestedAt: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        holds,
        pagination: {
          total,
          page: Number(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
