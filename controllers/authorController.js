const Author = require('../models/Author');
const Book = require('../models/Book');
const handleError = require('../utils/handleError');

exports.createAuthor = async (req, res) => {
  try {
    const { name, country, bio } = req.body;
    const author = await Author.create({ name, country, bio });
    res.status(201).json(author);
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAuthors = async (req, res) => {
  try {
    res.json(await Author.find());
  } catch (error) {
    handleError(res, error);
  }
};

exports.getAuthorById = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (error) {
    handleError(res, error);
  }
};

exports.updateAuthor = async (req, res) => {
  try {
    const { name, country, bio } = req.body;
    const author = await Author.findByIdAndUpdate(
      req.params.id,
      { name, country, bio },
      { new: true, runValidators: true }
    );
    if (!author) return res.status(404).json({ error: 'Author not found' });
    res.json(author);
  } catch (error) {
    handleError(res, error);
  }
};

// Rule 4, Option A: block the delete if the author still has books (409)
exports.deleteAuthor = async (req, res) => {
  try {
    const author = await Author.findById(req.params.id);
    if (!author) return res.status(404).json({ error: 'Author not found' });

    const bookCount = await Book.countDocuments({ author: author._id });
    if (bookCount > 0) {
      return res.status(409).json({
        error: `Cannot delete ${author.name}: they still have ${bookCount} book(s). Delete those books first.`,
      });
    }

    await author.deleteOne();
    res.json({ message: 'Author deleted' });
  } catch (error) {
    handleError(res, error);
  }
};
