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

exports.getBooks = async (req, res) => {
  try {
    res.json(await Book.find().populate('author'));
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
