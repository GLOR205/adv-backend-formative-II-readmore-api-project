const router = require('express').Router();
const c = require('../controllers/bookController');

router.route('/').post(c.createBook).get(c.getBooks);

module.exports = router;
