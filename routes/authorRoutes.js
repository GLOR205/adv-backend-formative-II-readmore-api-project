const router = require('express').Router();
const c = require('../controllers/authorController');

router.route('/').post(c.createAuthor).get(c.getAuthors);
router.route('/:id').get(c.getAuthorById).put(c.updateAuthor).delete(c.deleteAuthor);
router.get('/:id/books', c.getBooksByAuthor);

module.exports = router;
