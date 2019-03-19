var express = require('express');
var router = express.Router();
const auth = require('./auth');
router.use('/api', require('./api'));
// router.use('/remote', require('./remote'));
router.use('/auth', auth);
module.exports = router;