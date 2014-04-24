var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
var fs = require('fs');
var multiparty = require('multiparty');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

app.use(favicon());
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded());
app.use(function(req, res, next){
    if(req.method === 'POST' && req.headers['content-type'].indexOf("multipart/form-data") !== -1){
        var form = new multiparty.Form();
        form.parse(req, function(err, fields, files){
            req.files = files;
            next();
        });
    }
    else next();
});
app.use(cookieParser());
app.use(require('less-middleware')({ src: path.join(__dirname, 'public') }));
app.use(express.static(path.join(__dirname, 'public')));

// Require all the models
fs.readdirSync(__dirname + '/models').forEach(function(filename){
    if (~filename.indexOf('.js')) { require(__dirname + '/models/'+ filename); }
})

// Load routes
var routes = require('./routes/index');
app.use('/', routes);

/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development settings
if (app.get('env') === 'development') {
    mongoose.connect('mongodb://ampersandre:password@ds049337.mongolab.com:49337/reddit');
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// Production settings
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;

app.set('port', process.env.PORT || 3000);
var debug = require('debug')('tagur');

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});
