var userController = require('../../app/web/user');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/athlete', function (req, res, next) {
    userController.getAthlete(req, res, next);
});

router.post('/register', function (req, res, next) {
    userController.store(req, res, next);
});

router.get('/', function (req, res, next) {
    userController.get(req, res, next);
});

module.exports = router;