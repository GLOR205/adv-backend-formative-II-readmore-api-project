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
