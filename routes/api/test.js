var testController = require('../../app/web/test');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/create', function (req, res, next) {
    testController.store(req, res, next);
});

router.get('/:id', function (req, res, next) {
    testController.get(req, res, next);
});

module.exports = router;