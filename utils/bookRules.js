const Book = require('../models/Book');

// Stops user text such as "(" from being read as regex symbols
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Rule 3: returns an error message, or null if everything is fine
const checkPriceAndYear = ({ price, publishedYear }) => {
  if (price !== undefined && price <= 0) {
    return 'price must be greater than 0';
  }
  const currentYear = new Date().getFullYear();
  if (publishedYear !== undefined && (publishedYear > currentYear || publishedYear < 1450)) {
    return `publishedYear must be between 1450 and ${currentYear}`;
  }
  return null;
};

// Rule 2: same author + same title, ignoring upper/lower case
const titleExistsForAuthor = async (title, authorId, excludeBookId) => {
  const filter = {
    author: authorId,
    title: new RegExp(`^${escapeRegex(title.trim())}$`, 'i'),
  };
  if (excludeBookId) filter._id = { $ne: excludeBookId };
  return Book.exists(filter);
};

module.exports = { escapeRegex, checkPriceAndYear, titleExistsForAuthor };
