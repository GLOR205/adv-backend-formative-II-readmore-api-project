const Book = require('../models/Book');
const Author = require('../models/Author');
const handleError = require('../utils/handleError');
const { escapeRegex, checkPriceAndYear, titleExistsForAuthor } = require('../utils/bookRules');

exports.createBook = async (req, res) => {
  try {
    const { title, genre, price, publishedYear, author } = req.body;

    // Rule 1: no orphan books (400)
    if (!author) return res.status(400).json({ error: 'author id is required' });
    const authorExists = await Author.exists({ _id: author });
    if (!authorExists) {
      return res.status(400).json({ error: 'No author exists with that id' });
    }

    // Rule 3: values the schema can't express (422)
    const ruleError = checkPriceAndYear({ price, publishedYear });
    if (ruleError) return res.status(422).json({ error: ruleError });

    // Rule 2: no duplicate title for the same author (409)
    if (typeof title === 'string' && (await titleExistsForAuthor(title, author))) {
      return res.status(409).json({ error: 'This author already has a book with that title' });
    }

    const book = await Book.create({ title, genre, price, publishedYear, author });
    await book.populate('author');
    res.status(201).json(book);
  } catch (error) {
    handleError(res, error);
  }
};

// Rule 5: dynamic filter, search, sort (+ pagination challenge)
exports.getBooks = async (req, res) => {
  try {
    const { genre, author, minPrice, maxPrice, search, sort, order } = req.query;

    // Start empty; add a condition ONLY if its param was sent
    const filter = {};
    if (genre) filter.genre = new RegExp(`^${escapeRegex(genre)}$`, 'i');
    if (author) filter.author = author;
    if (search) filter.title = new RegExp(escapeRegex(search), 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    let query = Book.find(filter).populate('author');

    const allowedSort = ['price', 'title', 'publishedYear'];
    if (allowedSort.includes(sort)) {
      query = query.sort({ [sort]: order === 'desc' ? -1 : 1, _id: 1 });
    }

    res.json(await query);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('author');
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
};

// The same rules apply on update, otherwise PUT would bypass them
exports.updateBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });

    const { title, genre, price, publishedYear, author } = req.body;

    if (author !== undefined && !(await Author.exists({ _id: author }))) {
      return res.status(400).json({ error: 'No author exists with that id' });
    }

    const ruleError = checkPriceAndYear({ price, publishedYear });
    if (ruleError) return res.status(422).json({ error: ruleError });

    const finalTitle = title ?? book.title;
    const finalAuthor = author ?? book.author;
    if (await titleExistsForAuthor(finalTitle, finalAuthor, book._id)) {
      return res.status(409).json({ error: 'This author already has a book with that title' });
    }

    // Only apply the fields that were actually sent
    const updates = Object.fromEntries(
      Object.entries({ title, genre, price, publishedYear, author }).filter(([, v]) => v !== undefined)
    );
    book.set(updates);
    await book.save();
    await book.populate('author');
    res.json(book);
  } catch (error) {
    handleError(res, error);
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ error: 'Book not found' });
    res.json({ message: 'Book deleted' });
  } catch (error) {
    handleError(res, error);
  }
};
