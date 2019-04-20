var dashboardController = require('../../app/web/dashboard');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.get('/', function (req, res, next) {
    dashboardController.get(req, res, next);
});

module.exports = router;