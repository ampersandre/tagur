var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var Image = mongoose.model('Image');

/* GET home page. */
router.get('/', function(req, res) {
    Image.find().limit(6).sort('date').exec(function(err, images) {
      if (err) { throw err; }
      res.render('index', { images: images });
    });
});

module.exports = router;
