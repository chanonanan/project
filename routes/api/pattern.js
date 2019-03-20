var patternController = require('../../app/web/pattern');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/', function (req, res, next) {
    patternController.getPattern(req, res, next);
});

module.exports = router;