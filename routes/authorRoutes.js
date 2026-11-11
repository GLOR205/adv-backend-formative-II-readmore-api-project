const router = require('express').Router();
const c = require('../controllers/authorController');

router.route('/').post(c.createAuthor).get(c.getAuthors);

module.exports = router;
