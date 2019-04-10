var userController = require('../../app/web/user');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/player', function (req, res, next) {
    userController.getPlayer(req, res, next);
});

router.post('/register', function (req, res, next) {
    userController.store(req, res, next);
});

module.exports = router;