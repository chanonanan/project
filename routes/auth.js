const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const passport = require("passport");
const userController = require('../app/web/user');
/* POST login. */
router.post('/login', function (req, res, next) {
    passport.authenticate('local', { session: false }, (err, user, info) => {
        if (err || !user) {
            return res.status(400).json({
                message: 'Something is not right',
                user: user
            });
        }
        req.login(user, { session: false }, (err) => {
            if (err) {
                res.send(err);
            }
            const token = jwt.sign(user.toJSON(), 'your_jwt_secret');
            return res.json({ user, token });
        });
    })(req, res);
});
router.get('/user', passport.authenticate('jwt', { session: false }),
    function (req, res, next) {
        userController.own(req, res, next);
    });
module.exports = router;