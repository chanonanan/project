var testController = require('../../app/web/test');
var recordController = require('../../app/web/record');
var express = require('express');
var router = express.Router();
const passport = require('passport');

router.post('/create', function (req, res, next) {
    testController.store(req, res, next);
});

router.get('/all', function (req, res, next) {
    testController.list(req, res, next);
});

router.get('/history', function (req, res, next) {
    testController.getHistory(req, res, next);
});

router.get('/:id', function (req, res, next) {
    testController.get(req, res, next);
});

router.delete('/reset/:test_id', (req, res, next) => {
    recordController.reset(req, res, next);
});


module.exports = router;