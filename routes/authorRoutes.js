const router = require('express').Router();
const c = require('../controllers/authorController');

router.route('/').post(c.createAuthor);

module.exports = router;
