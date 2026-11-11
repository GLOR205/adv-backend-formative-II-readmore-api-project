const router = require('express').Router();
const c = require('../controllers/bookController');

router.route('/').post(c.createBook);

module.exports = router;
