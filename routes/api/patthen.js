var patthenController = require('../../app/web/patthen');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/', function (req, res, next) {
    patthenController.getPatthen(req, res, next);
});

module.exports = router;