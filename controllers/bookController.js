const Book = require("../models/Book");

// Module 2: Add a book
exports.addBook = async (req, res, next) => {
  try {
    const { title, author, isbn, category, description, totalCopies } = req.body;

    const existingBook = await Book.findOne({ isbn });
    if (existingBook) {
      return res.status(409).json({
        success: false,
        message: "A book with this ISBN already exists",
        errorCode: "DUPLICATE_ISBN",
      });
    }

    const book = await Book.create({
      title,
      author,
      isbn,
      category,
      description: description || "",
      totalCopies,
      availableCopies: totalCopies,
    });

    res.status(201).json({
      success: true,
      message: "Book added successfully",
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// Module 2: Get all books
exports.getAllBooks = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, category, available } = req.query;
    const query = { isActive: true };

    if (category) query.category = category;
    if (available === "true") query.availableCopies = { $gt: 0 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        books,
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

// Module 2: Get single book
exports.getBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      data: book,
    });
  } catch (error) {
    next(error);
  }
};

// Module 2: Update book
exports.updateBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book || !book.isActive) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    const { title, author, isbn, category, description, totalCopies } = req.body;

    if (isbn && isbn !== book.isbn) {
      const existingBook = await Book.findOne({ isbn });
      if (existingBook) {
        return res.status(409).json({
          success: false,
          message: "A book with this ISBN already exists",
          errorCode: "DUPLICATE_ISBN",
        });
      }
    }

    const updatedFields = {};
    if (title !== undefined) updatedFields.title = title;
    if (author !== undefined) updatedFields.author = author;
    if (isbn !== undefined) updatedFields.isbn = isbn;
    if (category !== undefined) updatedFields.category = category;
    if (description !== undefined) updatedFields.description = description;
    if (totalCopies !== undefined) {
      updatedFields.totalCopies = totalCopies;
      const diff = totalCopies - book.totalCopies;
      updatedFields.availableCopies = Math.max(0, book.availableCopies + diff);
    }

    const updatedBook = await Book.findByIdAndUpdate(req.params.id, updatedFields, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Book updated successfully",
      data: updatedBook,
    });
  } catch (error) {
    next(error);
  }
};

// Module 2: Delete book (soft delete)
exports.deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!book) {
      return res.status(404).json({
        success: false,
        message: "Book not found",
        errorCode: "NOT_FOUND",
      });
    }

    res.status(200).json({
      success: true,
      message: "Book deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Module 3: Search catalog
exports.searchBooks = async (req, res, next) => {
  try {
    const { title, author, category, available, page = 1, limit = 10 } = req.query;
    const query = { isActive: true };

    if (title) query.title = { $regex: title, $options: "i" };
    if (author) query.author = { $regex: author, $options: "i" };
    if (category) query.category = { $regex: category, $options: "i" };
    if (available === "true") query.availableCopies = { $gt: 0 };

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort({ title: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      success: true,
      data: {
        books,
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
