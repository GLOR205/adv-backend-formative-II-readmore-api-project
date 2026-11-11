const Author = require('../models/Author');
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
