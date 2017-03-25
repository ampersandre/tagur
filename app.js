var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var hbs = require('hbs');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');


var app = express();

console.log('setting up middleware');
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + '/views/partials');
app.enable('view cache');

app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
//app.use(multer({ dest: './public/uploads/'}));+
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

console.log('creating image schema');
// Execute the Image schema definition
require('./models/Image');

console.log('attaching routes');
app.use('/', require('./routes/index'));
app.use('/images', require('./routes/images'));
app.use('/new', require('./routes/new'));

console.log('assigning default error handler');
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

mongoose.connect(process.env.MONGO_CONNECTION_STRING);

module.exports = app;
