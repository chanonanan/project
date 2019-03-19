var express = require('express');
var router = express.Router();

router.use('/test', require('./test'));
router.use('/user', require('./user'));
router.use('/patthen', require('./patthen'));

router.use(function (err, req, res, next) {
  if (err.name === 'ValidationError') {
    return res.status(422).json({
      errors: Object.keys(err.errors).reduce(function (errors, key) {
        errors[key] = err.errors[key].message;

        return errors;
      }, {})
    });
  }

  return next(err);
});

module.exports = router;