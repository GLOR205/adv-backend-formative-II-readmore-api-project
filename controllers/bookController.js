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
