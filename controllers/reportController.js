const Transaction = require("../models/Transaction");
const Book = require("../models/Book");
const MembershipPlan = require("../models/MembershipPlan");

// Module 12: Overdue report
exports.overdueReport = async (req, res, next) => {
  try {
    const now = new Date();

    const overdueTransactions = await Transaction.find({
      status: { $in: ["issued", "overdue"] },
      dueDate: { $lt: now },
    })
      .populate("bookId", "title author isbn category")
      .populate("memberId", "name email membershipId memberType")
      .sort({ dueDate: 1 });

    const plans = await MembershipPlan.find({ isActive: true });
    const finePerDayMap = plans.reduce((map, p) => {
      map[p.memberType] = p.finePerDay;
      return map;
    }, {});

    const totalOverdue = overdueTransactions.length;
    const totalPendingFine = overdueTransactions.reduce((sum, t) => {
      const diffDays = Math.ceil(
        (now.getTime() - t.dueDate.getTime()) / (1000 * 60 * 60 * 24)
      );
      const member = t.memberId;
      const rate = member
        ? finePerDayMap[member.memberType] ?? 2
        : 2;
      return sum + diffDays * rate;
    }, 0);

    res.status(200).json({
      success: true,
      data: {
        totalOverdue,
        totalPendingFine,
        transactions: overdueTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Module 12: Most borrowed books report
exports.mostBorrowedBooks = async (req, res, next) => {
  try {
    const { limit: limitParam = 10 } = req.query;
    const limit = Number(limitParam);

    const result = await Transaction.aggregate([
      {
        $group: {
          _id: "$bookId",
          borrowCount: { $sum: 1 },
          bookTitle: { $first: "$bookTitle" },
        },
      },
      {
        $sort: { borrowCount: -1 },
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "books",
          localField: "_id",
          foreignField: "_id",
          as: "bookDetails",
        },
      },
      {
        $unwind: "$bookDetails",
      },
      {
        $project: {
          _id: 1,
          borrowCount: 1,
          bookTitle: "$bookDetails.title",
          author: "$bookDetails.author",
          isbn: "$bookDetails.isbn",
          category: "$bookDetails.category",
          totalCopies: "$bookDetails.totalCopies",
          availableCopies: "$bookDetails.availableCopies",
        },
      },
    ]);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// Module 12: Inventory health report
exports.inventoryHealth = async (req, res, next) => {
  try {
    const books = await Book.find({ isActive: true })
      .select("title author isbn category totalCopies availableCopies lostCopies damagedCopies")
      .sort({ title: 1 });

    const totalBooks = books.length;
    const totalCopies = books.reduce((sum, b) => sum + b.totalCopies, 0);
    const availableCopies = books.reduce((sum, b) => sum + b.availableCopies, 0);
    const lostCopies = books.reduce((sum, b) => sum + b.lostCopies, 0);
    const damagedCopies = books.reduce((sum, b) => sum + b.damagedCopies, 0);
    const lowStock = books.filter(
      (b) => b.availableCopies === 0 && b.totalCopies > 0
    ).length;

    res.status(200).json({
      success: true,
      data: {
        totalBooks,
        totalCopies,
        availableCopies,
        lostCopies,
        damagedCopies,
        lowStockTitles: lowStock,
        books,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Module 10: Update copy status
exports.updateCopyStatus = async (req, res, next) => {
  try {
    const { lostCopies, damagedCopies } = req.body;

    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    const updateFields = {};
    if (lostCopies !== undefined) {
      updateFields.lostCopies = lostCopies;
    }
    if (damagedCopies !== undefined) {
      updateFields.damagedCopies = damagedCopies;
    }

    // Recalculate available copies
    const newLost = lostCopies !== undefined ? lostCopies : book.lostCopies;
    const newDamaged = damagedCopies !== undefined ? damagedCopies : book.damagedCopies;
    updateFields.availableCopies = Math.max(
      0,
      book.totalCopies - newLost - newDamaged
    );

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Copy status updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};
