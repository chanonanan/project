var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')

var routes = require('./routes/index');

var app = express();
app.use(cors());
var bodyParser = require('body-parser');
// app.set('port', 3000);
app.use(bodyParser.json({limit: '50mb'}));

app.use(logger('dev'));
app.use(bodyParser.json());
require('./passport');
app.use(cookieParser());

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
// no stacktraces leaked to user unless in development environment
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: (app.get('env') === 'development') ? err : {}
  });
});

module.exports = app;

