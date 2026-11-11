const router = require('express').Router();
const c = require('../controllers/authorController');

router.route('/').post(c.createAuthor).get(c.getAuthors);
router.route('/:id').get(c.getAuthorById);

module.exports = router;
