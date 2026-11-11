const router = require('express').Router();
const c = require('../controllers/bookController');

router.route('/').post(c.createBook).get(c.getBooks);
router.route('/:id').get(c.getBookById);

module.exports = router;
